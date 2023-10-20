import shap
import functools
from copy import deepcopy
from polyjuice.generations import ALL_CTRL_CODES
from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
import torch
from polyjuice import Polyjuice

def shap_qqd_polyjucie():
    orig = {'text': "How can I help a friend experiencing serious depression?",
            'text_pair': "How do I help a friend who is in depression?"}


    orig_label = 1
    # setup a prediction function for computing the shap feature importance
    is_cuda = False
    model_name = "textattack/bert-base-uncased-QQP"
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForSequenceClassification.from_pretrained(model_name)

    pipe = pipeline(
        "sentiment-analysis", model=model, tokenizer=tokenizer,
        framework="pt", device=0 if is_cuda else -1, return_all_scores=True)

    # some wrapper for prediction
    def extract_predict_label(raw_pred):
        raw_pred = sorted(raw_pred, key=lambda r: -r["score"])
        if raw_pred:
            return raw_pred[0]["label"]
        return None

    def predict(examples, predictor, batch_size=128):
        raw_preds, preds, distribution = [], [], []
        with torch.no_grad():
            for e in (range(0, len(examples), batch_size)):
                raw_preds.extend(predictor(examples[e:e + batch_size], padding=True, truncation=True))
        for raw_pred in raw_preds:
            raw_pred = raw_pred if type(raw_pred) == list else [raw_pred]
            for m in raw_pred:
                m["label"] = int(m["label"].split("_")[1])
        return raw_preds

    # perturb the second question in orig.
    p = predict([orig], predictor=pipe)[0]
    print(p, extract_predict_label(p))
    # perturb_idx = 1
    
    #### 1. 生成干扰后文本
    pj = Polyjuice(model_path="uw-hai/polyjuice", is_cuda=False)
    perturb_idx = 'text_pair'
    perturb_texts = pj.perturb(
        orig[perturb_idx],
        ctrl_code=ALL_CTRL_CODES,
        num_perturbations=None, perplex_thred=10)
    print(perturb_texts)

 #    perturb_texts = ['How do I help a suicidal girl?',
 # 'How do I help a friend who is suicidal?',
 # 'How do I get help a friend who is in depression?',
 # 'How do I help a friend who is in really bad health?',
 # 'How do I help a friend who is in deep trouble?',
 # 'How would I help a friend who is in depression?',
 # 'How do I help a friend who is in health?',
 # 'How do I help a friend?',
 # 'How do I help a suicidal student?',
 # 'How do I not help a friend who is in depression?',
 # 'How can I help a friend who is in depression?']
    def wrap_perturbed_instances(perturb_texts, orig, perturb_idx="text_pair"):
        perturbs = []
        for a in perturb_texts:
            curr_example = deepcopy(orig)
            curr_example[perturb_idx] = a
            # print(curr_example)
            perturbs.append(curr_example)

        # print(perturbs)
        return perturbs
    i_count_pred_per = 0
    def predict_on_perturbs(perturb_texts, orig, predictor, perturb_idx='text_pair'):  # org: perturb_idx=1
        perturbs = wrap_perturbed_instances(perturb_texts, orig, perturb_idx)

        perturbs_preds = predict(perturbs, predictor=predictor)
        perturbs_pred_dicts = [{p["label"]: p["score"] for p in perturbs_pred} for perturbs_pred in perturbs_preds]
        orig_preds = predict([orig], predictor=predictor)
        orig_pred = extract_predict_label(orig_preds[0])
        print(f"orig_pred: {orig_pred}")
        print(f":perturbs_pred_dicts:{perturbs_pred_dicts}")

        # the return is probability of the originally predicted label
        return [pr_dict[orig_pred] for pr_dict in perturbs_pred_dicts]

    def normalize_shap_importance(features, importances, is_use_abs=True):
        normalized_features = {}
        for idx, (f, v) in enumerate(zip(features, importances)):
            f = f.strip('Ġ')
            if not f.startswith("##"):
                key, val = "", 0
            key += f.replace("#", "").strip()
            val += v
            if (idx == len(features) - 1 or (not features[idx + 1].startswith("##"))) and key != "":
                normalized_features[key] = abs(val) if is_use_abs else val
        return normalized_features
    # perturb_text orig
    def explain_with_shap(orig, predictor=pipe, tokenzier=pipe.tokenizer, perturb_idx='text_pair'):
        predict_for_shap_func = functools.partial(
            predict_on_perturbs, orig=orig, predictor=predictor, perturb_idx=perturb_idx)
        shap_explainer = shap.Explainer(predict_for_shap_func, tokenizer)
        need_to_explain = str(orig[perturb_idx])
        # need_to_explain =  'How do I help a friend who is in anaphylactic shock?'
        exp = shap_explainer([need_to_explain])
        return normalize_shap_importance(exp.data[0], exp.values[0])

    #### 2. 针对 text_pair， 利用shap 生成 token 对应的 feature importance
    feature_importance_dict = explain_with_shap(orig)
    if isinstance(feature_importance_dict,dict):
        for k,v in feature_importance_dict.items():
            print(f"'{k}': {v}")

    else:
        print(feature_importance_dict)
    # get the predictions for original and also new instances
    orig_pred = predict([orig], predictor=pipe)[0]
    print('orginal output:')
    print(orig_pred)

    perturb_instances = wrap_perturbed_instances(perturb_texts, orig, perturb_idx)
    perturb_preds = predict(perturb_instances, predictor=pipe)
    # feature_importance_dict = {'How': 0.052321239694720134,
    #      'do': 0.052321239694720134,
    #      'I': 0.05254904864705168,
    #      'help': 0.05254904864705168,
    #      'a': 0.03752649684611242,
    #      'friend': 0.03752649684611242,
    #      'who': 0.03752649684611242,
    #      'is': 0.03752649684611242,
    #      'in': 0.2708918958087452,
    #      'depression': 0.2708918958087452,
    #      '?': 0.07552210992434993}
    ### 3. 根据 feature weight 挑选出最佳的 perturb text 作为生成cf
    surprises = pj.select_surprise_explanations(
        orig_text=orig[perturb_idx],
        perturb_texts=perturb_texts,
        orig_pred=orig_pred,
        perturb_preds=perturb_preds,
        feature_importance_dict=feature_importance_dict)

    print('----------:suprises:-----------')
    print(surprises)

if __name__ == '__main__':
    shap_qqd_polyjucie()
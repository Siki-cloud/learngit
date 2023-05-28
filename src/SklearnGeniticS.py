import os.path

import numpy as np
from genetic_selection import GeneticSelectionCV
from sklearn.neural_network import MLPRegressor
import scipy.io as sio
from sklearn.model_selection import KFold
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import r2_score, mean_squared_error,accuracy_score
import matplotlib.pyplot as plt
from sklearn.tree import DecisionTreeClassifier
import warnings
warnings.filterwarnings("ignore")
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split


def load_data(rfile='./datasets/datasets/Adenocarcinoma.mat'):
    # read dataset
    mat = sio.loadmat(rfile)
    #print(mat )
    data = mat['data']
    y = data[:,0]
    x = data[:,1:]
    return x,y

def GS(datafile,logname="GS",logdir='log',epoach=1):
    print('\n--------------------------------------')
    print(datafile)
    # 设置log路径
    if not os.path.exists(logdir):
        os.mkdir(logdir)
    logpath = os.path.join(logdir,logname+'.txt')
    if os.path.exists(logpath):
        logpath = os.path.join(logdir,logname+'(1).txt')

    # xielog
    f = open(logpath,'w')
    header = 'no.k,gs_score,featurenum,cfs_score,unselect_score\n'
    f.writelines(header)

    # 数据获取
    x, y = load_data(datafile)
    print(x.shape, y.shape)

    # 定义记录
    total_itera = epoach
    best_k = 0
    curr_score = 0
    cur_bestscore = 0
    cur_bestfeaturesnum = None
    cur_bestfeatures = None

    unselect_score = 0
    for k in range(total_itera) :
        print(f'第{k+1}/{total_itera}次测试')
        # 手动划分训练集和测试集
        x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.2, random_state=42)

        # 特征选择 计算每一轮的准确率
        estimator = RandomForestClassifier()
        clf = GeneticSelectionCV(estimator,
                                 cv=10,
                                 verbose=1,
                                 scoring="accuracy",
                                 n_population=200,  # 种群数目
                                 crossover_proba=0.5,  # 自然选择
                                 mutation_proba=0.2,
                                 n_generations=200,
                                 crossover_independent_proba=0.5,  # 交叉
                                 mutation_independent_proba=0.05,  # 编译
                                 tournament_size=3,
                                 n_gen_no_change=10,
                                 caching=True,
                                 n_jobs=-1)
        clf.fit(x_train, y_train)
        score = clf.score(x_test, y_test)

        # 选择后
        x_train_s = x_train[:, clf.support_]
        x_test_s = x_test[:, clf.support_]

        estimator.fit(x_train_s, y_train)
        y_predict = estimator.predict(x_test_s)
        cfsscore =accuracy_score(y_predict,y_test)

        #不选择
        orclf =  RandomForestClassifier()
        orclf.fit(x_train,y_train)
        ory_pred = orclf.predict(x_test)
        oraccuracy_score = accuracy_score(y_test,ory_pred)
        unselect_score +=oraccuracy_score
        # 数据处理和记录
        print(f"第{k+1}/{total_itera}次的GA score={score},classifier score ={cfsscore}, 不做选择的精度 accur_score={oraccuracy_score}")
        line = str(k+1)+','+ str(score)+','+ str(clf.n_features_)+','+str(cfsscore)+','+str(oraccuracy_score)+'\n'
        f.writelines(line)
        if score > cur_bestscore:
            cur_bestfeaturesnum = clf.n_features_
            cur_bestfeatures = clf.support_
            cur_bestscore = score
            best_k = k
        curr_score += score

    print('有效变量的数量：', cur_bestfeaturesnum)
    print(np.array(cur_bestfeatures).shape)
    print(cur_bestfeatures)
    avg_score = curr_score / total_itera
    oravg_score = unselect_score /total_itera

    selected = np.array(cur_bestfeatures)
    selectstr = change(selected)
    print(selectstr)
    line="有效数量："+str(cur_bestfeaturesnum)+\
         '\navg_GAscore:'+str(avg_score)+ \
         '\nunselected_avg score:' + str(oravg_score)+\
         '\nbest features selected:'+str(selectstr)

    f.writelines(line)
    f.close()
    print("current best score is :%.2f" % cur_bestscore, "best k:%d" % best_k,"average score:%.2f"%avg_score)

def change(str):
    newstr=''
    for i in str:
        if i:
            newstr+='1'
        else:
            newstr+='0'
    return newstr



if __name__ == '__main__':
      datafiles = [r'../datasets/Lymphoma.mat','../datasets/SRBCT.mat']
      datasets = ['Adenocarcinoma','SRBCT','Prostate_tumor','Breast3','DLBCL','Prostate6033']
      dir = '../datasets'
      for dataset in datasets:
          datafile = os.path.join(dir,dataset+'.mat')
          datalog = dataset+'_decisiontree'

          GS(datafile,logname=datalog,logdir='../log/RF' ,epoach=5)
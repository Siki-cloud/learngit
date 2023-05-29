import pandas as pd
import matplotlib.pyplot as plt
import random
from sklearn import tree
from sklearn.model_selection import cross_val_score


def load_data(datafile):
    # read dataset
    mat = sio.loadmat(datafile)
    print(mat)
    data = mat['data']
    y = data[:, 0]
    x = data[:, 1:]
    return x, y
import scipy.io as sio
class GeneticSelect:

    def __init__(self,x,y,iterations=100,pop_size=100,pc=0.25,pm=0.01,cv=10,drawitera=True):

        self.iterations = iterations# 迭代次数
        self.pop_size = pop_size# 种群大小，多少个染色体
        self.pc = pc# 交叉概率
        self.pm = pm# 变异概率
        #self.x,self.y = x,y
        self.x = pd.DataFrame(x)
        self.y = pd.DataFrame(y)
        self.pop = []  # 种群
        self.fitness_list = []  # 适应度
        self.ratio_list = []  # 累计概率
        self.chrom_length = len(self.x)
        self.cv = cv
        self.draw = drawitera
    # 初始化种群
    def geneEncoding(self):
        i = 0
        while i < self.pop_size:
            temp = []
            has_1 = False  # 这条染色体是否有1
            for j in range(self.chrom_length):
                rand = random.randint(0, 1)
                if rand == 1:
                    has_1 = True
                temp.append(rand)
            if has_1:  # 染色体不能全0
                i += 1
                self.pop.append(temp)


    # 计算适应度
    def calFitness(self):
        self.fitness_list.clear()
        for i in range(self.pop_size):  # 计算种群中每条染色体的适应度
            X_test = self.x

            has_1 = False
            for j in range(self.chrom_length):
                if self.pop[i][j] == 0:
                    X_test = X_test.drop(columns=j)
                else:
                    has_1 = True
            X_test = X_test.values

            if has_1:
                clf = tree.DecisionTreeClassifier()  # 决策树作为分类器
                fitness = cross_val_score(clf, X_test, self.y, cv=self.cv).mean()  # 10次交叉验证  StratifiedKFold将尝试在每次折叠中保持该比例
                self.fitness_list.append(fitness)
            else:
                fitness = 0  # 全0的适应度为0
                self.fitness_list.append(fitness)


    # 计算适应度的总和
    def sumFitness(self):
        total = 0
        for i in range(self.pop_size):
            total += self.fitness_list[i]
        return total


    # 计算每条染色体的累计概率
    def getRatio(self):
        self.ratio_list.clear()
        self.ratio_list.append(self.fitness_list[0])
        for i in range(1, self.pop_size):
            self.ratio_list.append(self.ratio_list[i - 1] + self.fitness_list[i])
        self.ratio_list[-1] = 1


    # 选择
    def selection(self):
        global pop
        total_fitness = self.sumFitness()
        for i in range(self.pop_size):
            self.fitness_list[i] = self.fitness_list[i] / total_fitness
        self.getRatio()

        rand_ratio = []  # 随机概率
        for i in range(self.pop_size):
            rand_ratio.append(random.random())
        rand_ratio.sort()

        new_pop = []  # 新种群
        i = 0  # 已经处理的随机概率数
        j = 0  # 超出范围的染色体数

        while i < self.pop_size:
            if rand_ratio[i] < self.ratio_list[j]:  # 随机数在第j个染色体的概率范围内
                new_pop.append(self.pop[j])
                i += 1
            else:
                j += 1

        self.pop = new_pop


    # 交叉
    def crossover(self):
        for i in range(self.pop_size - 1):  # 若交叉，则染色体i与染色体i+1交叉
            if random.random() < self.pc:  # 发生交叉
                cpoint = random.randint(0, self.chrom_length - 1)  # 随机选择交叉点
                temp1 = []
                temp2 = []
                temp1.extend(self.pop[i][:cpoint])
                temp1.extend(self.pop[i + 1][cpoint:])
                temp2.extend(self.pop[i + 1][:cpoint])
                temp2.extend(self.pop[i][cpoint:])
                self.pop[i] = temp1
                self.pop[i + 1] = temp2


    # 变异
    def mutation(self):
        for i in range(self.pop_size):
            if random.random() < self.pm:  # 发生变异
                mpoint = random.randint(0, self.chrom_length - 1)  # 随机选择变异点
                if self.pop[i][mpoint] == 1:
                    self.pop[i][mpoint] = 0
                else:
                    self.pop[i][mpoint] = 1


    # 最优解
    def getBest(self):
        best_chrom = self.pop[0]
        best_fitness = self.fitness_list[0]
        for i in range(1, self.pop_size):
            if self.fitness_list[i] > best_fitness:
                best_fitness = self.fitness_list[i]  # 最佳适应值
                best_chrom = self.pop[i]  # 最佳染色体

        return best_chrom, best_fitness

    def GA(self,draw=True):
        if draw :
            plt.xlabel('iterations')
            plt.ylabel('best fitness')
            plt.xlim((0, self.iterations))  # x坐标范围
            plt.ylim((0, 1))  # y坐标范围
            px = []
            py = []
            plt.ion()

        results = []
        self.geneEncoding()  # 初始化种群
        for i in range(self.iterations):
            print(i)

            self.calFitness()  # 计算种群中每条染色体适应度

            best_chrom, best_fitness = self.getBest()
            results.append([i, best_chrom, best_fitness])

            self.selection()  # 选择
            self.crossover()  # 交叉
            self.mutation()  # 变异

            print([i, best_chrom, best_fitness])
            if draw:
                px.append(i)  # 画图
                py.append(best_fitness)
                plt.plot(px, py)
                plt.show()
                plt.pause(0.001)
        return results


if __name__ == '__main__':
    x,y =load_data('../datasets/Prostate_tumor.mat')
    G= GeneticSelect(x=x,y=y)
    G.GA(draw=True)

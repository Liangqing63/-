import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
# import tensorflow as tf
import tensorflow.compat.v1 as tf
tf.disable_v2_behavior()


# 读取序列数据
data = pd.read_csv("训练集.csv")
# 取前800个
data = data.values[2000:]
print(len(data))
# 标准化数据
normalize_data = (data - np.mean(data)) / np.std(data)
# print(normalize_data)
# normalize_data = normalize_data[:, np.newaxis]
# data=data[:, np.newaxis]
s = np.std(data)
m = np.mean(data)
# 序列段长度
time_step = 71
# 隐藏层节点数目
rnn_unit = 8
# cell层数
lstm_layers = 2
# 序列段批处理数目
batch_size = 7
# 输入维度
input_size = 1
# 输出维度
output_size = 1
# 学习率
lr = 0.006
train_x, train_y = [], []
for i in range(len(data) - time_step - 1):
    x = normalize_data[i:i + time_step]
    y = normalize_data[i + 1:i + time_step + 1]
    train_x.append(x.tolist())
    train_y.append(y.tolist())

X = tf.placeholder(tf.float32, [None, time_step, input_size])  # shape(?,time_step, input_size)
Y = tf.placeholder(tf.float32, [None, time_step, output_size])  # shape(?,time_step, out_size)

weights = {
    'in': tf.Variable(tf.random_normal([input_size, rnn_unit])),
    'out': tf.Variable(tf.random_normal([rnn_unit, 1]))
}
biases = {
    'in': tf.Variable(tf.constant(0.1, shape=[rnn_unit, ])),
    'out': tf.Variable(tf.constant(0.1, shape=[1, ]))
}


def lstm(batch):
    w_in = weights['in']    #权值
    b_in = biases['in']     #常数值
    input = tf.reshape(X, [-1, input_size])
    # print("input")
    # print(input)
    input_rnn = tf.matmul(input, w_in) + b_in                           #矩阵相乘
    input_rnn = tf.reshape(input_rnn, [-1, time_step, rnn_unit])        #重新组织数据

    cell = tf.nn.rnn_cell.MultiRNNCell([tf.nn.rnn_cell.BasicLSTMCell(rnn_unit) for i in range(lstm_layers)])
    init_state = cell.zero_state(batch, dtype=tf.float32)

    output_rnn, final_states = tf.nn.dynamic_rnn(cell, input_rnn, initial_state=init_state, dtype=tf.float32)
    output = tf.reshape(output_rnn, [-1, rnn_unit])
    w_out = weights['out']
    b_out = biases['out']
    pred = tf.matmul(output, w_out) + b_out
    return pred, final_states


def train_lstm():
    global batch_size
    with tf.variable_scope("sec_lstm"):
        pred, _ = lstm(batch_size)
    loss = tf.reduce_mean(tf.square(tf.reshape(pred, [-1]) - tf.reshape(Y, [-1])))
    train_op = tf.train.AdamOptimizer(lr).minimize(loss)
    saver = tf.train.Saver(tf.global_variables())
    loss_list = []
    with tf.Session() as sess:
        sess.run(tf.global_variables_initializer())
        for i in range(201):  # We can increase the number of iterations to gain better result.
            start = 0
            end = start + batch_size
            while (end < len(train_x)):
                _, loss_ = sess.run([train_op, loss], feed_dict={X: train_x[start:end], Y: train_y[start:end]})
                start += batch_size
                end = end + batch_size
            loss_list.append(loss_)
            if i % 10 == 0:
                print("Number of iterations:", i, " loss:", loss_list[-1])
                if i > 0 and loss_list[-2] > loss_list[-1]:
                    saver.save(sess, 'model_save1\\modle.ckpt')
        # I run the code in windows 10,so use  'model_save1\\modle.ckpt'
        # if you run it in Linux,please use  'model_save1/modle.ckpt'
        print("The train has finished")

#
# train_lstm()


def prediction(data):
    mean,std,train_x,train_y = train_data(data)
    with tf.variable_scope("sec_lstm", reuse=tf.AUTO_REUSE):
        pred, _ = lstm(1)
    saver = tf.train.Saver(tf.global_variables())
    with tf.Session() as sess:
        saver.restore(sess, 'model_save1\\modle.ckpt')
        # I run the code in windows 10,so use  'model_save1\\modle.ckpt'
        # if you run it in Linux,please use  'model_save1/modle.ckpt'
        predict = []
        for i in range(0, np.shape(train_x)[0]):
            next_seq = sess.run(pred, feed_dict={X: [train_x[i]]})
            predict.append(next_seq[-1])
        # plt.figure()
        # plt.plot(list(range(len(data))), data, color='b')
        # plt.plot(list(range(time_step + 1, np.shape(train_x)[0] + 1 + time_step)), [value * s + m for value in predict],
        #          color='r')
        # print(len(predict))
        # plt.show()
        for i in range(0,len(predict)):
            predict[i] = predict[i] * std + mean
        return predict


prediction()

def train_data(data):
    # X = tf.placeholder(tf.float32, shape=[None, time_step, input_size])
    data_test=data[:]
    mean = np.mean(data_test, axis=0)
    std = np.std(data_test, axis=0)
    normalized_test_data = (data_test - mean) / std
    train_x, train_y = [], []
    for i in range(len(data) - time_step - 1):
        x = normalize_data[i:i + time_step]
        y = normalize_data[i + 1:i + time_step + 1]
        train_x.append(x.tolist())
        train_y.append(y.tolist())
    return mean,std,train_x,train_y


#include<stdio.h>

#include<string.h>


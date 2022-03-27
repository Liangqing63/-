import predict as pt
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
# import tensorflow as tf
import tensorflow.compat.v1 as tf
tf.disable_v2_behavior()
import socket
import sys
import threading
import json


def main():
    # 创建服务器套接字
    serversocket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    # 获取本地主机名称
    host = socket.gethostname()
    # 设置一个端口
    port = 30001
    # 将套接字与本地主机和端口绑定
    serversocket.bind((host, port))
    # 设置监听最大连接数
    serversocket.listen(5)
    # 获取本地服务器的连接信息
    myaddr = serversocket.getsockname()
    print("服务器地址:%s" % str(myaddr))
    # 循环等待接受客户端信息
    while True:
        # 获取一个客户端连接
        clientsocket, addr = serversocket.accept()
        print("连接地址:%s" % str(addr))
        try:
            msg = ''
            while True:
                # 读取recvsize个字节
                recvsize = 1024 * 1024
                rec = clientsocket.recv(recvsize)
                # 解码
                msg += rec.decode("utf-8")
                # 文本接受是否完毕，因为python socket不能自己判断接收数据是否完毕，
                # 所以需要自定义协议标志数据接受完毕
                if msg.strip().endswith('over'):
                    msg = msg[:-4]
                    break
            re = json.loads(msg)
            tmp = re["object"]
            # data = []
            # for i in range(len(tmp)):
            #     data.append(tmp[i])
            prediction = pt.prediction(tmp)
            # array = np.array(prediction)
            # result = array.reshape((-1, 1))
            # result = json.dumps(result)
            print(prediction)
            result = np.array(prediction).reshape((-1)).tolist()
            # result = []
            # for i in range(len(prediction)):
            #     result.append(prediction[i][0].)
            for i in range(0, len(result)):
                if (result[i] < 0):
                    result[i] = 0
                result[i] = round(result[i])
            print(result)
            result = json.dumps(result)
            # clientsocket.send(("%s" % result).encode("utf-8"))

            clientsocket.send(("%s" % (result)).encode("utf-8"))
            print("任务结束.....")
            clientsocket.close()
            pass
        except Exception as identifier:
            print(identifier)
            pass
        pass

    serversocket.close()
    pass

if __name__ == '__main__':
    main()
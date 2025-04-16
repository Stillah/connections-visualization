import pandas as pd
import requests
from time import sleep

# Python script that reads .csv file and send the packages to a Flask server 
df = pd.read_csv('ip_addresses.csv')
df.sort_values(by=['Timestamp'], inplace=True)
df.rename({'ip address': 'ip'}, axis=1, inplace=True)

prev = df.loc[0, 'Timestamp']
for i in range(df.size // df.columns.size):
    curr_time = df.loc[i, 'Timestamp']
    if prev != curr_time:
        sleep((curr_time - prev) / 1000)
        prev = curr_time
    response = requests.post(url='http://127.0.0.1:8080/new_connection', json=df.loc[i].to_json())
print('done') 
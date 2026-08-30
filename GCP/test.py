import pandas as pd
data = pd.read_csv("server_health.csv")
print(data.columns)
for i in data:
    print(i)



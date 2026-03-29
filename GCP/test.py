reserved = [
    45, 2, 199, 150, 87, 3, 400, 250, 60, 61, 62,
    10, 11, 12, 300, 301, 302, 75, 76, 500, 501,
    1000, 5, 6, 7, 8, 9, 200, 201, 202, 203,
    800, 805, 810, 900, 901, 902, 903,
    100, 101, 102, 103, 104,
    600, 601, 602, 603, 604, 605,
    700, 710, 720, 730,
    20, 25, 30, 35,
    450, 460, 470,
    1200, 1250, 1300
]

sortedList = sorted(reserved)
sortedlistlen = range(len(sortedList)-1)
gapdict = {}
for i in sortedlistlen:
    for j in sortedList:
        gapdict[sortedList[i+1] - sortedList[i]-1] = sortedList.index(j)
print(gapdict)











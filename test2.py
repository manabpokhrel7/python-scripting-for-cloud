class Test:
    def __init__(self,name, age):
        self.name=name
        self.age=age

    def read(self):
        print(f"my name is {self.name}")
        print(f"My age is {self.age}")

person = Test("manab", "25")
print(person.read())
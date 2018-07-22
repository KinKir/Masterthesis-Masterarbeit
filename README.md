# My master thesis\\Meine Masterarbeit\\硕士毕业设计。

Online address\\在线演示地址:
https://zhangzhili000.github.io/Masterthesis-Masterarbeit/


### Notice:
1.You must use this in Chrome. \
2.If you want to click another button to watch another animation, you should firstly click the "Terminate" button, otherwise, may occur some arror.

### Hinweise:
1.Du musst im Chrome diese Webapplikation benutzen. \
2.Falls du eine Animationstaste schon geklickt hast, und dann du eine andere Animation schauen willst, musst du zuerst Terminate klickst, dann die andere Animationstaste klicken. 


### 使用注意：
1.必须在Chrome浏览器中才能正常运行这个应用。 \
2.如果已经触发一个动画，在执行过程中，想要点击演示其他的动画，请先按下Terminate按钮，然后在点击其他动画按钮。否则，可能会出现多个动画同时执行的情况，导致演示错乱。



### 项目目的：
该项目的目的是为了让数据库、SQL初学者通过使用这个软件，能够对关系运算的计算过程和基本的SQL Query语句的执行过程有基本的理解。大致理解相关的关系运算是如何执行的，而不是通过数据库软件，只能看到最后的结果，并不能直接看到数据是如何一步步被提取出来的。


### 项目基础：
基于Vanilla JavaScript和HTML5 Canvas进行开发。与导师多次进行面谈，获取并理解完整的需求。不考虑浏览器兼容性，只需要能够在Chrome上正常运行即可。不得使用任何框架、库、包、非原生API。必须使用面向对象方式编程，保证程序的可扩展性，不考虑程序运行性能问题，不考虑由于数据数量大而导致的问题的解决方案。建立空白工程，从零开始写。

### 项目过程：
1.得到简单需求说明，通过多次与导师的面谈得到详细的需求。\
2.进行需求分析，使用UML图画出程序流程图，类图，对象关系图等。\
3.画出image prototype。\
4.编写代码，并在编写过程中保持与导师联系。使用敏捷开发方式，每周进行一次面谈，交流已经做了什么，遇到什么问题，接下来做什么。在前期进行过需求调整，以及对象的重新设计。在中期，对项目有了更深的理解，对代码进行了优化和重构。反复执行敏捷开发流程，直到实现软件所有功能。\
5.完成所有需求功能，进行使用测试。寻找了若干用户进行使用，记录使用过程，使用结果反馈。 \
6.根据使用记录和结果反馈，进行优化升级，使软件对使用者更加友好，提高使用者使用软件的效率，使其使用之后更容易理解关系运算和SQL Query执行过程。 \
7.重复第5和第6步，进行软件功能性和体验性优化。 



***************************************************************************************
***************************        The User Guide          ****************************
***************************************************************************************

---------------------------------------------------------------------------------------
-----------------------       I.How to use this software:          --------------------

1.Open the index.html in Chrome browser.

2.i:
  The SQL Query part:
    Input a number in the range that has been shown by the hint.
    Click a button in the panel to watch the animation.

2.ii:
  The Relational Algebra part:
    Click the initialization button.
    Click a button in the panel to watch the animation.

  The nested Algebra:
    If you want look the animation of a nested statement, please refresh the web page.
    Then click the "Initialize Data and Begin" button of hybrid algebra.
    After watching this animation, if you want look animations in other parts, it needs to refresh the web page. Or the functions of single Algebra may occur some bugs.

---------------------------------------------------------------------------------------
-------------       II.Some explaination about the animations:       ------------------

1.The animation of Union:
  The right table has not been changed, because it is a copy of original table.

2.The animations of all operations in relational algebra:
  All the tables operated by the operations of relational algebra are a copy of original table.

---------------------------------------------------------------------------------------
---  III.If you want look or change the queries, the statements, and the database:  ---

1.The queries and statements are stored in file "Data/queries.json".
  
  1.i:The structure of this file:
    It has three parts:"comment","SQL_query","algebra".
    The "SQL_query" is a array of queries.
    The "algebra" contains the statement for single operation, and the statement for nested operations.
    This software has not a Checker to check if the statement is valid. So, please input a query or a statement that satisfies the specification.

2.The database is stored in file "Data/data.json".

3.If you just want look the query, you can also look it in the developer tool. The query and the result of calculation of every step are print in the console.
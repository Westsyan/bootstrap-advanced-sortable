# bootstrap-advanced-sortable.js

#### 介绍
Bootstrap-table 表头筛选控件

#### 软件架构
利用Bootstrap-table特性,在表头添加筛选排序，支持文本搜索，数值搜索，日期搜索，单选和复选。

#### 依赖包

|依赖包|版本|
|----|----|
|jQuery|v3.2.1|
|Bootstrap|v4.5.3|
|Bootstrap-table|v1.11.1|
|select2|v4.0.3|

#### 筛选类型说明
##### 1.  文本类型（text）
<img src="https://images.gitee.com/uploads/images/2020/1109/180315_d76c297b_1497137.png" width="50%" />
提供模糊搜索功能，根据输入的参数模糊匹配返回对应的结果
##### 2.  数值类型(num)
![输入图片说明](https://images.gitee.com/uploads/images/2020/1109/180527_852c1664_1497137.png "屏幕截图.png")
提供区间搜索功能，所搜列必须为数值，可以搜索最小值和最大值之间的结果，也可以搜索所有大于最小值或小于最大值的结果。
##### 3.  日期类型（date）
![输入图片说明](https://images.gitee.com/uploads/images/2020/1109/180820_dfb16921_1497137.png "屏幕截图.png")
提供区间搜索日期功能，使用方法同数值类型。
##### 4.  单选（radio）
![输入图片说明](https://images.gitee.com/uploads/images/2020/1109/182447_5034e35f_1497137.png "屏幕截图.png")
如图所示，根据所选项筛选出对应的结果
##### 5.  复选（checkbox）
![输入图片说明](https://images.gitee.com/uploads/images/2020/1109/182625_0a86a422_1497137.png "屏幕截图.png")
与单选功能相同，但可以搜索多个选项

### 参数说明
|表格参数|默认值|说明|
|----|----|----|
|data-advanced-sortable|false|默认false。设为true开启控件功能|

|列参数|默认值|说明|
|----|----|----|
|data-sortable|false|默认false。设为true开启排序功能，bootstrap-advanced-sortable.js控件开启后会覆盖bootstrap-table默认的筛选功能|
|data-search-type|-|可选参数，设置开启搜索功能。可选值：text,num,date,radio,checkbox|
|data-search-select|-|传值参数，只有当搜索类型设为radio和checkbox时才生效，要求输入数组类型。样例：data-search-select=["选项1","选项2","选项3"]|


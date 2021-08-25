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
<img src="https://images.gitee.com/uploads/images/2020/1109/180315_d76c297b_1497137.png" width="70%" /><br/>
提供模糊搜索功能，根据输入的参数模糊匹配返回对应的结果
##### 2.  数值类型(num)
<img src="https://images.gitee.com/uploads/images/2020/1109/180527_852c1664_1497137.png" width="70%" /><br/>
提供区间搜索功能，所搜列必须为数值，可以搜索最小值和最大值之间的结果，也可以搜索所有大于最小值或小于最大值的结果。
##### 3.  日期类型（date）
<img src="https://images.gitee.com/uploads/images/2020/1109/180820_dfb16921_1497137.png" width="70%" /><br/>
提供区间搜索日期功能，使用方法同数值类型。
##### 4.  单选（radio）
<img src="https://images.gitee.com/uploads/images/2020/1109/182447_5034e35f_1497137.png" width="70%" /><br/>
如图所示，根据所选项筛选出对应的结果
##### 5.  复选（checkbox）
<img src="https://images.gitee.com/uploads/images/2020/1109/182625_0a86a422_1497137.png" width="70%" /><br/>
与单选功能相同，但可以搜索多个选项

### 参数说明
<table style="width:1140px">
<thead>
<tr><th width="20%">表格参数</th><th width="10%">默认值</th><th>说明</th></tr></thead>
<tbody><tr><td>data-advanced-sortable</td><td>false</td><td>默认false。设为true开启控件功能</td></tr></tbody>
</table>

<table style="width:1140px">
<thead>
<tr><th width="20%">列参数</th><th width="7%">默认值</th><th>说明</th></tr></thead>
<tbody>
<tr><td>data-sortable</td><td>false</td><td>默认false。设为true开启排序功能，bootstrap-advanced-sortable.js控件开启后会覆盖bootstrap-table默认的筛选功能</td></tr>
<tr><td>data-search-type</td><td>-</td><td>可选参数，设置开启搜索功能。可选值：text,num,date,radio,checkbox。</td></tr>
<tr><td>data-search-select</td><td>-</td><td>传值参数，只有当搜索类型设为radio和checkbox时才生效，要求输入数组类型。样例：data-search-select=["选项1","选项2","选项3"]</td></tr>
</tbody>
</table>

#### 服务端分页传参说明
##### 1.客户端分页
sidePagination设为"client"时为客户端分页，只要把相应的数据以JSON格式传到前端即可，由前端JS来实现排序，搜索功能。
##### 2.服务端分页
sidePagination设为"server"时为服务端分页，这时需要与服务端交互才能实现排序，搜索功能。<br/>
当选择服务器分页时，客户端会向服务端传输五个参数：<br/>
- limit ： Int类型,页面展示数据条数；
- offest ： Int类型，当前页起始行数；
- order ： String类型，排序方式，asc:顺序，desc逆序；
- search ： Option[String]类型,默认为空值。进行搜索时，会传输JSON字符串回服务端，样例：<br/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{"id":{"field":"id","searchType":"text","data":"100"},"name":{"field":"name","searchType":"text","data":"200"}}<br/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;有四个参数，服务端解析这个json字符串获取相应的结果，然后截取offest - offest+limit 之间的数据传输的客户端进行展示；
- sort ： Option[String]类型，以sort列进行排序，默认为空值。
示例代码（Scala）：

```
  case class PageData(limit: Int, offset: Int, order: String, search: Option[String], sort: Option[String])

  val pageForm: Form[PageData] = Form(
    mapping(
      "limit" -> number,
      "offset" -> number,
      "order" -> text,
      "search" -> optional(text),
      "sort" -> optional(text)
    )(PageData.apply)(PageData.unapply)
  )

def dealMapDataByPage(page: PageData) = {
    val searchX = page.search match {
      case None => 获取初始数据代码
      case Some(y) => 筛选数据代码
    }
    val sortX = page.sort match {
      case None => searchX
      case Some(y) => 以列进行排序
    }
    val orderX = page.order match {
      case "asc" => sortX
      case "desc" => sortX.reverse
    }
    //返回值
    orderX
  }

```
前端JS代码：

```
                $('#table').bootstrapTable({
                    method: 'post',
                    url: "/getData",
                    sidePagination: "server",
                    contentType: "application/x-www-form-urlencoded",
                    columns:[{
                        field:"testText",
                        title:"TestText",
                        sortable:"true",
                        searchType:"text"
                    },{
                        field:"testRadio",
                        title:"TestRadio",
                        sortable:"true",
                        searchType:"radio",
                        searchSelect:["test1","test2","test3"]
                    }]
                });
```




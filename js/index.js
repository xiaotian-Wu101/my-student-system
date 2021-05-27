/**
 *
 * @param {String} method 请求方式  不区分大小写
 * @param {String} url    请求地址  协议（http）+ 域名+ 端口号 + 路径
 * @param {String} data   请求数据  key=value&key1=value1
 * @param {Function} cb     成功的回调函数 callback: 回调函数
 * @param {Boolean} isAsync 是否异步 true 是异步  false 代表同步
 */
function ajax(method, url, data, cb, isAsync) {
  // get   url + '?' + data
  // post
  var xhr = null;
  if (window.XMLHttpRequest) {
    xhr = new XMLHttpRequest();
  } else {
    xhr = new ActiveXObject("Microsoft.XMLHTTP");
  }

  // xhr.readyState    1 - 4  监听是否有响应
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
      if (xhr.status == 200) {
        cb(JSON.parse(xhr.responseText));
      }
    }
  };
  method = method.toUpperCase();
  if (method == "GET") {
    xhr.open(method, url + "?" + data, isAsync);
    xhr.send();
  } else if (method == "POST") {
    xhr.open(method, url, isAsync);
    // key=value&key1=valu1
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send(data);
  }
}
// 表格数据
var tableData = [];

// bindEvent： 绑定事件函数
function bindEvent() {
  // 左侧导航切换行为 即 左侧菜单栏的点击事件
  var leftMenu = document.querySelector('.left-menu');
  leftMenu.onclick = function (e) {
    // e.target： 目标元素  当点击导航的时候是a标签
    // parentNode 父节点   ddNode： 当前点击的导航对应的dd元素节点
    var ddNode = e.target.parentNode;
    if (ddNode.tagName === 'DD') {
      removeClass(ddNode.parentNode.children, 'menu-active');
      ddNode.className = 'menu-active';
      // e.target.parentNode.classList.add('menu-active')
    }
  }
  // 新增学生按钮 点击行为
  var studentAddBtn = document.getElementById('student-add-btn');
  studentAddBtn.onclick = function (e) {
    // 阻止默认刷新页面的行为
    e.preventDefault();
    // 并且校验规则
    // 获取表单元素
    var form = document.getElementById('student-add-form');
    // 获取表单元素下面的数据 +  数据校验 
    var formData = getFormData(form);
    if (formData.status === 'success') {
      // 当前添加学生的信息
      var data = formData.data;
      // 当前学生信息数据转换成字符串的结构
      var dataStr = '';
      for (var prop in data) {
        dataStr += prop + '=' + data[prop] + '&';
      }
      // 提交给后台保存学生信息
      transferData({
        method: 'get',
        url: '/api/student/addStudent',
        data: dataStr,
        success: function (res) {
          alert('新增成功');
          getTableData();
          location.hash = '#student-list';

        }
      });

    } else {
      alert(formData.msg);
    }
  }
  // 编辑删除功能
  var tBody = document.querySelector('#student-list table tbody');
  var modal = document.querySelector('#student-list .modal');
  tBody.onclick = function (e) {
    //  判断当前点击的是不是编辑或者删除的按钮
    if (e.target.tagName === 'BUTTON') {
      // 进行编辑的功能
      // 获取当前标签身上的自定义属性data-index 的方法：getAttribute()    dataset: 存储这当前标签身上所有的data-属性
      // console.log(e.target.getAttribute('data-index'))
      // 当前点击的编辑对应学生的索引值
      var index = e.target.dataset.index;
      // 判断当前按钮是不是编辑按钮
      if (e.target.classList.contains('edit')) {
        // 拿到当前学生的数据 并且渲染弹窗数据
        renderEditForm(tableData[index]);
        modal.style.display = 'block';
      } else {
        var student = tableData[index];
        // 删除的操作  isDel： 是否删除  true 为是  false为否
        var isDel = confirm('确认删除学号为:' + student.sNo + '的学生信息嘛？');
        if (isDel) {
          transferData({
            method: 'get',
            url: '/api/student/delBySno',
            data: 'sNo=' + student.sNo + '&',
            success: function () {
              alert('删除成功');
              getTableData();
            }
          })
        }
      }
    }
  }
  // 点击遮罩层  弹窗消失
  modal.onclick = function (e) {
    if (e.target === this) {
      modal.style.display = 'none';
    }
  }
  var studentEditBtn = document.getElementById('student-edit-btn');

  studentEditBtn.onclick = function (e) {
    // 阻止默认刷新页面的行为
    e.preventDefault();
    // 并且校验规则
    // 获取表单元素
    var form = document.getElementById('student-edit-form');
    // 获取表单元素下面的数据 +  数据校验 
    var formData = getFormData(form);
    if (formData.status === 'success') {
      // 当前添加学生的信息
      var data = formData.data;
      // 当前学生信息数据转换成字符串的结构
      var dataStr = '';
      for (var prop in data) {
        dataStr += prop + '=' + data[prop] + '&';
      }
      // 提交给后台保存学生信息
      transferData({
        method: 'get',
        url: '/api/student/updateStudent',
        data: dataStr,
        success: function (res) {
          alert('修改成功');
          getTableData();
          modal.style.display = 'none';
        }
      });

    } else {
      alert(formData.msg);
    }
  }

}
// removeClass: 移除类名    nodeList: 节点列表  className： 要移除的类名
function removeClass(nodeList, className) {
  for (var i = 0; i < nodeList.length; i++) {
    nodeList[i].classList.remove(className);
  }
}

window.onload = function () {
  bindEvent();
  hashToMenu();
  // 浏览器的地址栏中 hash值变化
  window.onhashchange = function () {
    hashToMenu();
  }
}

// hashToMenu： 由hash值 对应左侧导航
function hashToMenu() {
  // 判断当前进入页面的时候 是不是有指定导航位置  如果有则定位到那个位置
  if (location.hash) {
    // hashName: 地址栏当中的hash的值  即锚点对应的值
    var hashName = location.hash;
    // activeMenu: 当前要定位的菜单元素
    var activeMenu = document.querySelector('.left-menu dd a[href="' + hashName + '"]');
    // 手动触发元素的点击事件
    activeMenu.click();
  } else {
    var activeMenu = document.querySelector('.left-menu dd a[href="#student-list"]');
    activeMenu.click();
  }
}

// 获取学生的表单数据函数  返回对象 {data: 当前学生的信息, status: 校验规则的状态， msg： 没有按照规则填写的错误提示}
function getFormData(form) {
  var name = form.name.value;
  var sex = form.sex.value;
  var email = form.email.value;
  var sNo = form.sNo.value;
  var birth = form.birth.value;
  var address = form.address.value;
  var phone = form.phone.value;
  // 最终返回的信息
  var result = {
    // 学生所有的信息
    data: {},
    // 当前表单校验是否成功， 即数据是否可以提交
    status: 'success',
    // 若表单校验不成功， 则msg表示提示的信息
    msg: ''
  };
  // 判断表单元素是否已经全部填写
  if (!name || !email || !sNo || !birth || !address || !phone) {
    result.status = 'fail';
    result.msg = '信息填写不全，请校验后提交';
    return result;
  }
  // 判断邮箱的格式 11111@qq.com   meiqi.dong@duyi-inc.com
  // emailReg: 邮箱正则表达式
  var emailReg = /^[\w\.-_]+@[\w-_]+\.com$/
  if (!emailReg.test(email)) {
    result.status = 'fail';
    result.msg = '邮箱格式不正确';
    return result;
  }
  // 判断学号的规则：  4 - 16位数字
  var sNoReg = /^\d{4,16}$/;
  if (!sNoReg.test(sNo)) {
    result.status = 'fail';
    result.msg = '学号应为4-16位有效数字';
    return result;
  }
  // 出生年份的校验 1975 - 2020
  if (birth < 1975 || birth > 2020) {
    result.status = 'fail';
    result.msg = '出生年份不正确';
    return result;
  }

  // 手机号的校验
  var phoneReg = /^1[3456789]\d{9}$/;
  if (!phoneReg.test(phone)) {
    result.status = 'fail';
    result.msg = '手机号码不正确';
    return result;
  }
  result.data = {
    name,
    sex,
    email,
    sNo,
    birth,
    address,
    phone
  };
  return result;
}

// 封装一个调用ajax函数的方法
/**
 * 
 * @param {Object} options
 *         method: 请求方式
 *          url: 请求路径
 *          data: 请求数据  (数据是不包含appkey的)
 *          success： 请求成功之后的回调函数  即后台成功处理我的数据的时候要做的总能
 *          
 */
function transferData(options) {
  ajax(options.method || 'GET', 'http://open.duyiedu.com' + options.url, options.data + 'appkey=VP_1_1611829731084',
    function (res) {
      if (res.status === 'fail') {
        alert(res.msg);
      } else {
        options.success(res.data);
      }
    }, true)
}


// 获取表格数据
function getTableData() {
  transferData({
    method: 'get',
    url: '/api/student/findAll',
    data: '',
    success: function (res) {
      tableData = res;
      renderTable(res);
    }
  })
}

getTableData();

// 渲染页面
function renderTable(data) {
  // for  forEach  map reduce filter sort 

  var str = data.reduce(function fun(pre, ele, index) {

    return pre + `<tr>
    <!-- td: 列 -->
    <td>${ele.sNo}</td>
    <td>${ele.name}</td>
    <td>${ele.sex == 0 ? '男' : '女'}</td>
    <td>${ele.email}</td>
    <td>${new Date().getFullYear() - ele.birth}</td>
    <td>${ele.phone}</td>
    <td>${ele.address}</td>
    <td>
        <!-- edit: 编辑   operation-btn: 操作-按钮 -->
        <button class="operation-btn edit" data-index="${index}">编辑</button>
        <button class="operation-btn remove" data-index="${index}">删除</button>
    </td>
</tr>`;
  }, "");
  var tbody = document.querySelector('#student-list table tbody')
  tbody.innerHTML = str;
}

// 渲染弹窗
function renderEditForm(data) {
  // 编辑表单元素
  var form = document.getElementById('student-edit-form');

  // 遍历当前学生的信息  
  for (var prop in data) {
    // 判断表单当中是否含有这个数据
    if (form[prop]) {
      form[prop].value = data[prop];
    }
  }
}
<template>
  <div idm-ctrl="idm_module" class="idm-data-model" :id="moduleObject.id" :idm-ctrl-id="moduleObject.id">
    <!-- 筛选条件 -->
    <div class="idm-dm-condition">
      <a-select style="width: 100px" allowClear dropdownClassName="idm_dev_theme" placeholder="类型" default-value=""
        v-model="condition.TYPE" @change="change">
        <a-select-option v-for="(item, index) in ConditionType" :key="index" :value="item.value">
          {{ item.text }}
        </a-select-option>
      </a-select>
      <a-select style="width: 150px" allowClear dropdownClassName="idm_dev_theme" placeholder="分组" default-value=""
        v-model="condition.GROUP_ID" @change="change">
        <a-select-option v-for="(item, index) in ConditionGroup" :key="index" :value="item.value">
          {{ item.text }}
        </a-select-option>
      </a-select>
      <a-select style="width: 150px" allowClear dropdownClassName="idm_dev_theme" placeholder="更新状态" default-value=""
        v-model="condition.PULL_TYPE" @change="change">
        <a-select-option v-for="(item, index) in ConditionPullType" :key="index" :value="item.value">
          {{ item.text }}
        </a-select-option>
      </a-select>
      <a-select style="width: 150px" allowClear dropdownClassName="idm_dev_theme" :mode="'multiple'"
        optionFilterProp="children" placeholder="产品标签" default-value="" v-model="condition.productList"
        @change="change">
        <a-select-option v-for="(item, index) in ConditionProductList" :key="index" :value="item.value">
          {{ item.text }}
        </a-select-option>
      </a-select>
      <a-input-search allowClear style="width: 200px" placeholder="搜索关键词" v-model="condition.searchText"
        @search="change" />
      <a-button @click="resetCondition()" style="margin-right: 10px">
        重置搜索
      </a-button>
      <a-button @click="handelShowDataModelTypeModal(undefined)" type="primary"> 新建模型 </a-button>
    </div>
    <!-- 表格 -->
    <div class="idm-dm-tablebox">
      <a-table :columns="columns" :data-source="dataRows" :loading="loading" :locale="{ emptyText: '暂无数据模型' }"
        :pagination="{
          current: current,
          'pageSize(.sync)': pageSize,
          total: totalCount,
        }" @change="changePage" rowKey="id">
        <div slot="action" slot-scope="text, record, index">
          <!-- <a @click="editDataRow(record, index)">创建数据源</a> -->
          <a-button type="link" size="small" :loading="record.updateLoading" @click="handleUpdateData(record, index)">
            {{ record.updateLoading ? '更新中..' : '更新数据' }}</a-button>
          <a-button type="link" size="small" @click="handleShowUpdateRecords(record, index)">更新记录</a-button>
          <a-button type="link" size="small" @click="handelShowDataModelTypeModal(record)">编辑</a-button>
          <a-popconfirm placement="topLeft" ok-text="确认" cancel-text="取消" @confirm="handleDeleteData(record, index)">
            <template slot="title">
              <p>确认删除该条数据？</p>
            </template>
            <a-button type="link" size="small">删除</a-button>
          </a-popconfirm>
        </div>
        <div slot="pullType" slot-scope="text">
          <a-tag :color="getCurrentPullType(text).color">
            {{ getCurrentPullType(text).text }}
          </a-tag>
        </div>
        <div slot="type" slot-scope="text">
          {{ ConditionType.filter((item) => item.value == text).length ? ConditionType.filter((item) => item.value ==
              text)[0].text : ""
          }}
        </div>
        <div slot="groupId" slot-scope="text">
          {{ ConditionGroup.filter((item) => item.value == text).length ? ConditionGroup.filter((item) => item.value ==
              text)[0].text : ""
          }}
        </div>
        <div slot="expandedRowRender" slot-scope="record" style="margin: 0">
          <div style="margin-bottom:5px;font-weight: bold;">基本信息</div>
          <a-descriptions bordered size="small" column="2">
            <a-descriptions-item label="作者">
              {{ record.author }}
            </a-descriptions-item>
            <a-descriptions-item label="共享属性">
              {{ record.shareType == "0" ? "私有" : "共享" }}
            </a-descriptions-item>
            <a-descriptions-item label="排序">
              {{ record.itemIndex }}
            </a-descriptions-item>
            <a-descriptions-item v-if="record.productNames" label="产品标签" :span="3">
              <template v-for="(item, tindex) in record.productNames.split(',')">
                <a-tag :key="tindex" v-if="item">{{ item }}</a-tag>
              </template>
            </a-descriptions-item>
            <a-descriptions-item label="标签" :span="3">
              <template v-for="(item, tindex) in record.tags.split(',')">
                <a-tag :key="tindex" v-if="item">{{ item }}</a-tag>
              </template>
            </a-descriptions-item>
            <a-descriptions-item label="描述" :span="3">
              {{ record.remark }}
            </a-descriptions-item>
          </a-descriptions>
          <div style="margin-top:10px">
            <div style="margin-bottom:5px;font-weight: bold;">详细信息</div>
            <!--接口API-->
            <div v-if="record.type == '4'">
              <a-descriptions bordered size="small" :column="3">
                <a-descriptions-item label="请求方式">
                  {{ record.requestType }}
                </a-descriptions-item>
                <a-descriptions-item label="请求地址" :span="2">
                  {{ record.api }}
                </a-descriptions-item>
                <a-descriptions-item label="超时时长(毫秒)">
                  {{ record.timeout }}
                </a-descriptions-item>
                <a-descriptions-item label="请求参数" :span="3">
                  {{ record.paramJson }}
                </a-descriptions-item>
                <a-descriptions-item label="请求头信息" :span="3">
                  {{ record.headerJson }}
                </a-descriptions-item>
                <a-descriptions-item label="调试结果" :span="3">
                  {{ record.debugResult }}
                </a-descriptions-item>
              </a-descriptions>
            </div>
            <!--Excel文件-->
            <div v-if="record.type == '3'">
              <a-descriptions bordered size="small" :column="1">
                <a-descriptions-item label="文件名">
                  {{ record.fileName }} <a style="margin-left:20px" @click="downloadFile(record)">下载</a>
                </a-descriptions-item>
                <a-descriptions-item label="文件内容">
                  {{ record.fileContent }}
                </a-descriptions-item>
                <a-descriptions-item label="调试结果">
                  {{ record.debugResult }}
                </a-descriptions-item>
              </a-descriptions>
            </div>
            <!--sql语句-->
            <div v-if="record.type == '2'">
              <a-descriptions bordered size="small" :column="1">
                <a-descriptions-item label="驱动名称">
                  {{ record.dbName }}
                </a-descriptions-item>
                <a-descriptions-item label="SQL语句">
                  {{ record.dbSql }}
                </a-descriptions-item>
                <a-descriptions-item label="调试结果">
                  {{ record.debugResult }}
                </a-descriptions-item>
              </a-descriptions>
            </div>
            <!--数据源类型-->
            <div v-if="record.type == '1'">
              <a-descriptions bordered size="small" :column="1">
                <a-descriptions-item label="数据源名称">
                  {{ record.dataSourceText }}
                </a-descriptions-item>
                <a-descriptions-item label="SQL语句">
                  {{ record.dbSql }}
                </a-descriptions-item>
                <a-descriptions-item label="调试结果">
                  {{ record.debugResult }}
                </a-descriptions-item>
              </a-descriptions>
            </div>

          </div>
        </div>
      </a-table>
    </div>
    <!-- 类型选择 -->
    <a-modal :visible="chooseDataModelTypeVisible" :footer="null" wrapClassName="idm-dm-type"
      :bodyStyle="{ 'padding': '18px', display: 'flex', 'flex-wrap': 'wrap' }" width="680px"
      :title="currentType === 1 ? '添加数据模型' : '修改数据模型'" @cancel="() => chooseDataModelTypeVisible = false">
      <div v-for="(item, index) in dataModelType" :key="index" class="idm-dm-type-box"
        @click="handelChooseModelType(item)" :class="currentData.type == item.value ? 'active' : ''">
        <svg-icon :iconClass="item.icon" className="modal-type-icon"></svg-icon>
        <div class="modal-type-title">{{ item.label }}</div>
        <div class="modal-type-desc">{{ item.desc }}</div>
      </div>
    </a-modal>
    <!-- 主要流程drawer -->
    <DataModelDrawer v-model="dataModalDrawerShow" ref="DataSourceForm" :visible="DataSourceFormVisible"
      :defaultValue.sync="currentData" :ConditionGroup="ConditionGroup" :ConditionType="ConditionType"
      :dataModelType="dataModelType" :ConditionModuleList="ConditionModuleList"
      :ConditionProductList="ConditionProductList" :destroyOnClose="true" @handleComplete="handleDataModelComplete"
      @create="saveCustomModuleFormHandleCreate">
    </DataModelDrawer>
    <!-- 选择数据源 -->
    <DataSourceSelect v-model="dataSourceSelectShow" @closeDataSource="closeDataSource"
      @handleDataSourceSelect="handleDataSourceSelect">
    </DataSourceSelect>
    <!-- 更新记录 -->
    <DataModalUpdateRecordsModal :defaultValue.sync="currentData" v-model="dataModalUpdateRecordsDrawerShow">
    </DataModalUpdateRecordsModal>
  </div>
</template>
<script>
import DataModelDrawer from '../innerComponents/DataModelDrawer'
import DataSourceSelect from '../innerComponents/DataSourceSelect'
import DataModalUpdateRecordsModal from '../innerComponents/DataModalUpdateRecordsModal'
import apis from '../api/dataModalUrls'
const columns = [
  { title: "名称", dataIndex: "title", width: 240, key: "title", ellipsis: true, sorter: true },
  {
    title: "类型",
    dataIndex: "type",
    align: 'right',
    sorter: true,
    key: "type",
    scopedSlots: { customRender: "type" },
  },
  {
    title: "所属分组",
    align: 'right', dataIndex: "groupId", key: "groupId", scopedSlots: { customRender: "groupId" }
  },
  { title: "状态", dataIndex: "pullType", width: 100, key: "pullType", scopedSlots: { customRender: "pullType" } },
  { title: "最近同步时间", dataIndex: "pullDate", key: "pullDate", ellipsis: true },
  {
    title: "操作",
    dataIndex: "",
    key: "x",
    width: 290,
    scopedSlots: { customRender: "action" },
  },
];
const dataModelType = [
  {
    label: '数据源建模',
    desc: '现有数据源新建数据表',
    icon: 'dataSource',
    value: '1'
  },
  {
    label: 'SQL建模',
    desc: '使用sql查询生成数据表',
    icon: 'SQL',
    value: '2'
  },
  {
    label: 'Excel上传',
    desc: '上传本地文件(.xls,.xlsx)',
    icon: 'Excel',
    value: '3'
  },
  {
    label: 'API链接',
    desc: '抓取API数据生成表格',
    icon: 'API',
    value: '4'
  }
]
export default {
  name: 'IDataModel',
  components: {
    DataModelDrawer,
    DataSourceSelect,
    DataModalUpdateRecordsModal
  },
  data() {
    return {
      moduleObject: {},
      propData: this.$root.propData.compositeAttr || {},
      loading: false,
      dataRows: [{
        type: 1,
        title: 12
      }],
      columns,
      pageSize: 10,
      current: 1,
      totalCount: 0,
      dataModelType,
      currentData: {},
      condition: {
        TYPE: "",
        GROUP_ID: "",
        PULL_TYPE: '',
        productList: [],
        searchText: "",
      },
      chooseDataModelTypeVisible: false,
      dataModalDrawerShow: false,
      dataModalUpdateRecordsDrawerShow: false,
      dataSourceSelectShow: false,
      ConditionGroup:
        IDM.setting?.develop?.dataSourceConditionGroup instanceof Array
          ? [{ text: "全部", value: "" }].concat(
            IDM.setting.develop.dataSourceConditionGroup
          )
          : [],
      // ConditionType:
      //   IDM.setting?.develop?.dataModelConditionType instanceof Array
      //     ? [{ text: "全部", value: "" }].concat(
      //       IDM.setting.develop.dataSourceConditionType
      //     )
      //     : [],
      ConditionType: [
        { text: "全部", value: "" },
        { text: "数据源", value: "1" },
        { text: "SQL", value: "2" },
        { text: "Excel文件", value: "3" },
        { text: "接口API", value: "4" },
      ],
      // ConditionPullType:
      //   IDM.setting?.develop?.ConditionPullType instanceof Array
      //     ? [].concat(IDM.setting.develop.ConditionPullType)
      //     : [],
      ConditionPullType: [
        { text: "全部", value: "" },
        { text: "更新失败", value: "-1", color: 'red' },
        { text: "未同步", value: "0", color: '' },
        { text: "同步成功", value: "1", color: 'green' },
        { text: "更新中...", value: "2", color: 'blue' },
      ],
      ConditionProductList:
        IDM.setting?.develop?.dataSourceConditionProductList instanceof Array
          ? [].concat(IDM.setting.develop.dataSourceConditionProductList)
          : [],
    }
  },
  created() {
    //数据源分组
    if (
      !IDM.develop.cacheData.DataSourceConditionGroupList &&
      IDM.type(IDM.setting.develop.dataSourceConditionGroup) == "string"
    ) {
      IDM.http.get(IDM.setting.develop.dataSourceConditionGroup).then((res) => {
        let resultData = [{ text: "全部", value: "" }];
        if (res.data.code == 200) {
          resultData = resultData.concat(res.data.data);
        }
        IDM.develop.cacheData.DataSourceConditionGroupList = resultData;
        this.ConditionGroup = resultData;
      });
    } else if (
      IDM.type(IDM.setting.develop.dataSourceConditionGroup) == "string"
    ) {
      this.ConditionGroup = IDM.develop.cacheData.DataSourceConditionGroupList;
    }
    //类型分组
    // if (
    //   !IDM.develop.cacheData.DataSourceConditionTypeList &&
    //   IDM.type(IDM.setting.develop.dataSourceConditionType) == "string"
    // ) {
    //   IDM.http.get(IDM.setting.develop.dataSourceConditionType).then((res) => {
    //     let resultData = [{ text: "全部", value: "" }];
    //     if (res.data.code == 200) {
    //       resultData = resultData.concat(res.data.data);
    //     }
    //     IDM.develop.cacheData.DataSourceConditionTypeList = resultData;
    //     this.ConditionType = resultData;
    //   });
    // } else if (
    //   IDM.type(IDM.setting.develop.dataSourceConditionType) == "string"
    // ) {
    //   this.ConditionType = IDM.develop.cacheData.DataSourceConditionTypeList;
    // }
    //产品分组
    if (
      !IDM.develop.cacheData.DataSourceConditionProductList &&
      IDM.type(IDM.setting.develop.dataSourceConditionProductList) == "string"
    ) {
      IDM.http
        .get(IDM.setting.develop.dataSourceConditionProductList)
        .then((res) => {
          let resultData = [];
          if (res.data.code == 200) {
            resultData = resultData.concat(res.data.data);
          }
          IDM.develop.cacheData.DataSourceConditionProductList = resultData;
          this.ConditionProductList = resultData;
        });
    } else if (
      IDM.type(IDM.setting.develop.dataSourceConditionProductList) == "string"
    ) {
      this.ConditionProductList =
        IDM.develop.cacheData.DataSourceConditionProductList;
    }
    this.moduleObject = this.$root.moduleObject
    this.convertAttrToStyleObject();
  },
  methods: {
    propDataWatchHandle(propData) {
      this.propData = propData.compositeAttr || {};
      this.convertAttrToStyleObject();
    },
    // 通过类型获取当前更新状态
    getCurrentPullType(pullType) {
      const item = this.ConditionPullType.filter(el => el.value != '').find(el => el.value == pullType)
      return item || {}
    },
    // 保存完成回调
    handleDataModelComplete() {
      this.chooseDataModelTypeVisible = false
      this.dataSourceSelectShow = false
      // 重置
      this.currentData = {}
      this.reload(true)
    },
    // 更新数据
    handleUpdateData(record, index) {
      const item = _.cloneDeep(this.dataRows[index])
      this.$set(this.dataRows, index, { ...item, pullType: '2', updateLoading: true })
      apis.requestUpdateDataModel({
        id: record.id
      }).then(res => {
        if (res.status == 200 && res.data.code == 200) {
          IDM.message.success(res.data.message)
        } else {
          IDM.message.error(res.data.message)
        }
      })
        .catch(function (error) {
          this.$set(this.dataRows, index, { ...item, updateLoading: false })
          IDM.message.error('操作失败')
        }).finally(() => {
          this.initData()
        })
    },
    // 删除
    handleDeleteData(record, index) {
      apis.requestDeleteDataModel({
        id: record.id
      }).then(res => {
        if (res.status == 200 && res.data.code == 200) {
          IDM.message.success(res.data.message)
          this.initData()
        } else {
          IDM.message.error(res?.data?.message || '操作失败')
        }
      })
        .catch(function (error) {
          IDM.message.error('操作失败')
        })
    },
    // 更新记录
    handleShowUpdateRecords(record, index) {
      this.currentData = Object.assign({}, this.currentData, {
        id: record.id,
        title: record.title
      })
      this.dataModalUpdateRecordsDrawerShow = true

    },
    // 选择数据源
    handleDataSourceSelect(selectDataSource) {
      //fix
      this.currentData = Object.assign({}, this.currentData, {
        dataSourceId: selectDataSource.id,
        dataSourceText: selectDataSource.title,
        dataSource: selectDataSource
      })
      this.dataModalDrawerShow = true
    },
    // 关闭数据源弹框， 开启模型类型选择
    closeDataSource() {
      this.dataSourceSelectShow = false
      // 新建
      if (this.currentData.isEditInfo != 1) {
        this.chooseDataModelTypeVisible = true
      }
    },
    // 新建/编辑模型
    handelShowDataModelTypeModal(record) {
      // 新增
      this.currentData = Object.assign({
        isEditInfo: record ? 1 : 0  // 1修改 0 新增
      }, record || {})
      // 修改, 不让修改类型
      if (record) {
        // 数据源类型, 显示数据源弹框
        if (record.type == 1) {
          this.dataSourceSelectShow = true
          return
        }
        this.dataModalDrawerShow = true
      } else {
        // 新增
        this.chooseDataModelTypeVisible = true
      }
      // 新增
    },
    // 选择数据模型类型
    handelChooseModelType(item) {
      this.currentData = Object.assign({}, this.currentData, { type: item.value })
      // 数据源类型，先选择数据源
      if (item.value == '1') {
        this.dataSourceSelectShow = true
        this.chooseDataModelTypeVisible = false
      } else {
        // 其他类型
        this.dataModalDrawerShow = true
      }
    },
    // 筛选条件变化
    change() {
      this.reload(true);
    },
    // 分页改变
    changePage(pagination) {
      if (pagination && pagination.current) {
        this.current = pagination.current;
        this.pageSize = pagination.pageSize;
      }
      //请求数据源
      this.initData();
    },
    convertAttrToStyleObject() {
      var styleObject = {};
      for (const key in this.propData) {
        if (this.propData.hasOwnProperty.call(this.propData, key)) {
          const element = this.propData[key];
          if (!element && element !== false && element != 0) {
            continue;
          }
          switch (key) {
            case "width":
            case "height":
              styleObject[key] = element;
              break;
            case "bgColor":
              if (element && element.hex8) {
                styleObject["background-color"] = element.hex8;
              }
              break;
            case "box":
              IDM.style.setBoxStyle(styleObject, element)
              break;
            case "border":
              IDM.style.setBorderStyle(styleObject, element)
              break;
            case "font":
              IDM.style.setFontStyle(styleObject, element)
              break;
          }
        }
      }
      window.IDM.setStyleToPageHead(this.moduleObject.id, styleObject);
      this.initData();
    },/**
       * 重新加载
       */
    reload(reloadFirstPage) {
      if (reloadFirstPage) {
        this.current = 1;
      }
      //请求数据源
      this.initData();
    },
    initData() {
      this.loading = true;
      var params = { ...this.condition };
      if (params.productList && params.productList.length) {
        let PRODUCT_IDS = [];
        params.productList.forEach((element) => {
          PRODUCT_IDS.push({ value: element });
        });
        params.PRODUCT_IDS = JSON.stringify(PRODUCT_IDS);
      }
      params["pageIndex"] = this.current;
      params["pageSize"] = this.pageSize;
      apis.requestModelList(params).then((res) => {
        if (res.status == 200 && res.data.code == 200) {
          this.dataRows = res.data.data.rows.map(el => ({ ...el, updateLoading: false }));
          this.totalCount = res.data.data.total;
          return
        }
        this.dataRows = []
        this.totalCount = 0
      })
        .catch(err => { })
        .finally(() => {
          this.loading = false;
        });
    },
    // 重置筛选条件
    resetCondition() {
      this.condition = {
        TYPE: "",
        GROUP_ID: "",
        PULL_TYPE: '',
        searchText: "",
      }
      this.reload(true);
    },
    receiveBroadcastMessage(object) {
      console.log("组件收到消息", object)
      if (object.type && object.type == "linkageShowModule") {
        this.showThisModuleHandle();
      } else if (object.type && object.type == "linkageHideModule") {
        this.hideThisModuleHandle();
      }
    },
    setContextValue(object) {
      console.log("统一接口设置的值", object);
      if (object.type != "pageCommonInterface") {
        return;
      }
      //这里使用的是子表，所以要循环匹配所有子表的属性然后再去设置修改默认值
      if (object.key == this.propData.dataName) {
        // this.propData.fontContent = this.getExpressData(this.propData.dataName,this.propData.dataFiled,object.data);
        this.$set(this.propData, "fontContent", this.getExpressData(this.propData.dataName, this.propData.dataFiled, object.data));
      }
    },
    sendBroadcastMessage(object) {
      window.IDM.broadcast && window.IDM.broadcast.send(object);
    }

  }
};
</script>

<style lang="scss" scoped>
.idm-data-model {
  .idm-dm-condition {
    display: flex;
    padding: 15px;

    &>* {
      margin-right: 15px;
    }
  }

  .idm-dm-tablebox {
    padding: 0px 15px;

    ::v-deep(.ant-btn-sm) {
      padding: 0 5px;
    }
  }
}

.active-class {
  background: #1890ff;
  transform: scale(1.1);

  .modal-type-title {
    color: #fff;
  }

  .modal-type-desc {
    color: #fff;
  }

  .modal-type-icon {
    color: #fff;
  }
}

.idm-dm-type-box {
  padding: 15px;
  background: rgb(240, 244, 247);
  margin: 0 20px 20px 0;
  display: inline-block;
  width: 180px;
  text-align: center;
  cursor: pointer;
  transition: .3s;

  &.active {
    @extend .active-class;
  }

  &:hover {
    @extend .active-class;
  }

  .modal-type-title {
    color: #333;
    margin: 5px 0 1px;
  }

  .modal-type-desc {
    color: #666;
    font-size: 12px;
  }

  .modal-type-icon {
    font-size: 35px;
    color: #1890ff;
  }
}
</style>
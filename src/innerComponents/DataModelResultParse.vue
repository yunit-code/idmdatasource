<template>
  <div class="idm-dm-result-parse-container">
    <div class="result-title">
      <span style="font-size: 16px;color:#333;margin: 0 10px 0 0">数据结构</span>
      <a-icon type="exclamation-circle" />
      勾选的字段须为相同层级, 避免解析错误
    </div>
    <a-table rowKey="id" class="idm-dm-select-data-table" style="margin: 10px 0 0 -20px" :pagination="false"
      size="small" :scroll="{ y: 460 }" :bordered="false" :columns="columns" :data-source="tableData"
      :locale="{ emptyText: '数据为空' }"
      :row-selection="{ selectedRowKeys: selectedRowKeys, onSelectAll: onSelectAll, onSelect: onSelect }">
      <template #customName="text, record">
        <a-input placeholder="字段重命名" size="small" @change="handleGenerateBottomTable" v-if="record.dataType == 2"
          v-model="record.customName" />
        <!-- 表名 -->
        <a-input placeholder="随机生成的表名，可修改" @change="handleGenerateBottomTable" style="width: 205%" size="small"
          v-if="record.dataType == 1" v-model="record.customTableName">
          <a-tooltip slot="suffix" :getPopupContainer="getPopupContainer" title="随机生成的表名，可修改">
            <a-icon type="info-circle" style="color: rgba(0,0,0,.35)" />
          </a-tooltip>
        </a-input>
      </template>
      <template #type="text, record">
        <a-select size="small" style="width: 100%" @change="handleGenerateBottomTable" v-if="record.dataType == 2"
          v-model="record.type">
          <a-select-option :value="1">文本</a-select-option>
          <a-select-option :value="2">数值</a-select-option>
          <a-select-option :value="3">长文本</a-select-option>
          <a-select-option :value="4">时间</a-select-option>
        </a-select>
      </template>
      <template #showName="text, record">
        <a-input placeholder="中文名" size="small" @change="handleGenerateBottomTable" v-if="record.dataType == 2"
          v-model="record.showName" />
        <!-- 关联父级字段 -->
        <a-select placeholder="关联父级字段" size="small" style="width: 220%" @change="handleGenerateBottomTable"
          v-if="record.dataType == 1" v-model="record.fidFiled">
          <a-select-option v-for="item, index in getParentFields(record)" :key="index" :value="item.customName">{{
              item.customName
          }}
          </a-select-option>
        </a-select>
      </template>
      <template #description="text, record">
        <a-input placeholder="字段描述" size="small" @change="handleGenerateBottomTable" v-if="record.dataType == 2"
          v-model="record.description" />
      </template>
    </a-table>
    <div class="idm-dm-table-preview-box" v-for="item, index in bottomTableList" :key="index">
      <div class="box-title">
        <span>数据预览</span>
        <a-input placeholder="随机生成的表名，可修改" style="width: 150px" size="small" v-model="item.customTableName" />
        <a-input placeholder="关联的父级表名(如果不存在可为空)+_+关联的父级字段，可修改" style="width: 200px" size="small"
          v-model="item.relationTableFiled" />
      </div>
      <a-table :scroll="{ x: item.columns.length > 4 ? item.columns.length * 210 : false }"
        class="idm-dm-generate-table" :pagination="false" size="small" bordered :columns="item.columns"
        :data-source="item.tableData"></a-table>
    </div>

  </div>
</template>

<script>
import { testResult } from '../mockData/dataModal'
const columns = [
  {
    title: '解析字段',
    dataIndex: 'name',
    key: 'name',
    width: '200px'
  },
  {
    title: '重命名',
    dataIndex: 'customName',
    key: 'customName',
    width: '100px',
    scopedSlots: { customRender: 'customName' },
  },
  {
    title: '类型',
    dataIndex: 'type',
    width: '90px',
    key: 'type',
    scopedSlots: { customRender: 'type' },
  },
  {
    title: '中文名',
    dataIndex: 'showName',
    width: '90px',
    key: 'showName',
    scopedSlots: { customRender: 'showName' },
  },
  {
    title: '描述',
    dataIndex: 'description',
    width: '90px',
    key: 'description',
    scopedSlots: { customRender: 'description' },
  },
];
export default {
  name: 'DataModelResultParse',
  data() {
    return {
      columns,
      tableData: testResult.data,
      readonlyTableData: Object.freeze([]), // 只读，用来查找使用，提升性能
      selectedRowKeys: [],
      bottomTableList: [{
        customTableName: '',
        relationTableFiled: '',
        columns: [
          {
            title: 'code',
            dataIndex: 'code',
            key: 'code',
          },
        ],
        tableData: [
          {
            code: '200',
          }
        ]
      }]
    }
  },
  watch: {
    selectedRowKeys: {
      handler() {
        this.handleGenerateBottomTable()
      },
      immediate: true
    }
  },
  methods: {
    getPopupContainer() {
      return document.getElementsByClassName('ant-drawer-content-wrapper')[0]
    },
    getParentFields(record) {
      const { fid } = record  // 父级id
      if (!fid) return []
      // 父级对象,不改变接口用readonlyTableData
      const parentObj = this.handleGetTableItem(this.readonlyTableData, fid)
      const items = []
      if (!parentObj.children || parentObj.children.length === 0) return []
      parentObj.children.forEach(el => {
        if (el.dataType == 2) { // 只要字段类型
          items.push(el)
        }
      })
      return items
    },
    // 根据id 获取所在item信息，一般用于查找父级item
    handleGetTableItem(tableList, id) {
      let item = {}
      tableList.forEach(el => {
        if (el.id === id) { item = el }
        else {
          if (!el.children || el.children.length === 0) return
          item = this.handleGetTableItem(el.children, id)
        }
      })
      return item
    },
    // 生成下面表格
    handleGenerateBottomTable() {
      const selectRowIds = this.selectedRowKeys
      this.bottomTableList = []
      if (selectRowIds.length === 0) return  // 选中为空直接返回
      this.handleSetTableSelectedTree(this.tableData, selectRowIds)
    },
    // 主逻辑，生成下面表格
    handleSetTableSelectedTree(tableData, selectRowIds) {
      tableData.forEach(el => {
        if (selectRowIds.includes(el.id)) {
          // 改变选中状态
          el.check = 1
          // 只要表类型的
          if (el.dataType == '1') {
            //子级只要选中的字段,不要表
            const hasCheckChildren = el.children.filter(els => selectRowIds.includes(els.id) && els.dataType != '1')
            // 不改变结构用readonlyTableData，提升性能
            const parentObj = this.handleGetTableItem(this.readonlyTableData, el.fid)
            const tableItemData = {}  // 表格数据，只要一条，预览用
            // 生成表头
            const columns = hasCheckChildren.map(els => {
              tableItemData[els.customName] = els.filedData // 表格数据填值
              return {
                ...els,
                title: els.customName, // 表头用自定义修改的字段名
                dataIndex: els.customName,
                key: els.customName
              }
            })
            // 生成单个表格对象
            const tableItem = {
              ...el,
              // 用父级自定义字段名，在父级的字段中，找关联的关系对象
              relationFileInfo: this.getParentFields(el).find(els => els.customName == el.fidFiled) || {},
              relationTableFiled: (!parentObj.customTableName && !el.fidFiled) ? '' : (parentObj.customTableName ? parentObj.customTableName : '') + '_' + el.fidFiled,
              columns,
              tableData: [tableItemData]
            }
            this.bottomTableList.push(tableItem)
          }
        } else {
          el.check = 0
        }
        if (!el.children || el.children.length === 0) return
        this.handleSetTableSelectedTree(el.children, selectRowIds)
      })
    },
    // 提供给父组件使用，获取参数
    getParams() {
      return {
        // 上面表格
        resultJson: JSON.stringify(this.tableData),
        // 下面预览
        dataTableListJson: JSON.stringify(this.bottomTableList),

      }
    },
    // 获取所有选中的id
    getAllCheckIds(tableData, idsArr) {
      tableData.forEach(el => {
        if (el.check) {
          idsArr.push(el.id)
          if (!el.children || el.children.length === 0) return
          this.getAllCheckIds(el.children, idsArr)
        }
      })
    },
    // 设置默认值，提供给父组件使用
    setDefaultValue(defaultValue) {
      if (!defaultValue.resultJson) return
      const tableData = JSON.parse(defaultValue.resultJson)
      if (tableData.length === 0) return
      this.tableData = tableData
      // 生成readonly data查找使用
      this.readonlyTableData = Object.freeze(_.cloneDeep(tableData))
      // 默认选中
      this.setDefaultCheckIds(tableData)
      // 延迟避免替换
      setTimeout(() => {
        this.bottomTableList = JSON.parse(defaultValue.dataTableListJson) || []
      }, 800)
    },
    setDefaultCheckIds(tableData) {
      const idsArr = []
      this.getAllCheckIds(tableData, idsArr)
      this.selectedRowKeys = idsArr
    },

    // 测试完后设置上面表格数据，提供父组件使用
    setTableData(tableData) {
      // 没有数据直接返回
      if (!tableData || tableData.length === 0) return
      this.tableData = tableData
      // 生成readonly data查找使用
      this.readonlyTableData = Object.freeze(_.cloneDeep(tableData))
      // 默认选中
      this.setDefaultCheckIds(tableData)
    },
    // 表格全选
    onSelectAll(selected) {
      if (selected) {
        const tableData = this.tableData;
        const arr = [];
        setVal(tableData, arr);
        this.selectedRowKeys = arr;
      } else {
        this.selectedRowKeys = [];
      }
      function setVal(list, arr) {
        list.forEach(v => {
          arr.push(v.id);
          if (v.children) {
            setVal(v.children, arr);
          }
        });
      }
    },
    // 增加antd表格上下级选中功能
    onSelect(record, selected) {
      const set = new Set(this.selectedRowKeys);
      const tableData = this.tableData;
      const id = record.id;
      if (selected) {
        set.add(id);
        record.children && setChildCheck(record.children);
        // setParentCheck(id);
      } else {
        set.delete(id);
        record.children && setChildUncheck(record.children);
        // setParentUncheck(id);
      }
      this.selectedRowKeys = Array.from(set);
      // 设置父级选择
      function setParentCheck(id) {
        let parent = getParent(id);
        if (parent) {
          set.add(parent.id);
          setParentCheck(parent.id);
        }
      }
      // 设置父级取消，如果父级的子集有选择，则不取消
      function setParentUncheck(id) {
        let childHasCheck = false,
          parent = getParent(id);
        if (parent) {
          let childlist = parent.children;
          childlist.forEach(function (v) {
            if (set.has(v.id)) childHasCheck = true;
          });
          if (!childHasCheck) {
            set.delete(parent.id);
            setParentUncheck(parent.id);
          }
        }
      }
      // 获取当前对象的父级
      function getParent(id) {
        for (let i = 0; i < tableData.length; i++) {
          if (tableData[i].id === id) {
            return null;
          }
        }
        return _getParent(tableData);
        function _getParent(list) {
          let childlist,
            isExist = false;
          for (let i = 0; i < list.length; i++) {
            if ((childlist = list[i].children)) {
              childlist.forEach(function (v) {
                if (v.id === id) isExist = true;
              });
              if (isExist) {
                return list[i];
              }
              if (_getParent(childlist)) {
                return _getParent(childlist);
              }
            }
          }
        }
      }
      // 设置child全选
      function setChildCheck(list) {
        list.forEach(function (v) {
          set.add(v.id);
          v.children && setChildCheck(v.children);
        });
      }
      // 设置child取消
      function setChildUncheck(list) {
        list.forEach(function (v) {
          set.delete(v.id);
          v.children && setChildUncheck(v.children);
        });
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.idm-dm-result-parse-container {
  padding: 20px 15px 0;

  .result-title {
    color: rgba(0, 0, 0, .5);
    font-weight: 400;
    font-size: 12px;
  }

  ::v-deep(.ant-table-body) {
    margin: 0 !important;

    &::-webkit-scrollbar {
      width: 5px;
      height: 5px;
    }

    &::-webkit-scrollbar-thumb {
      min-height: 28px;
      border-radius: 4px;
      background-color: rgba(0, 0, 0, .2);
    }

    &::-webkit-scrollbar-track-piece,
    &::-webkit-scrollbar-corner {
      background-color: transparent;
    }
  }

  .idm-dm-select-data-table {
    ::v-deep(th) {
      border: 0;
    }

    ::v-deep(td) {
      background: #fff;
      border: 0;
    }

    ::v-deep(.ant-table-small) {
      border: 0;
    }

  }

  .idm-dm-generate-table {
    margin: 5px 0 0 0;

    ::v-deep(th) {
      background: #fafafa !important;
    }

    ::v-deep(td) {
      background: #fff !important;
    }
  }

  .idm-dm-table-preview-box {
    margin: 20px 0 0 0;
    background: #f1f1f1;
    padding: 5px;

    .box-title {

      >* {
        margin: 0 10px 0 0;
      }
    }
  }
}
</style>
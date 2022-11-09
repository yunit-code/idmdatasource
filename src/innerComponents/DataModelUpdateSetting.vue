<template>
  <a-form :form="form" class="idm-dm-update-container">
    <a-form-item label="更新周期" :label-col="{ span: 4 }" :wrapper-col="{ span: 6 }">
      <a-select size="small" v-decorator="[
        'updateCycleType',
        {},
      ]" placeholder="更新周期">
        <a-select-option v-for="item in updateTypeMap" :key="item.value" :value="item.value">
          {{ item.label }}
        </a-select-option>
      </a-select>
    </a-form-item>
    <div class="online-container" v-if="form.getFieldValue('updateCycleType') == 2">
      <a-form-item label="更新频率" :label-col="{ span: 10 }" :wrapper-col="{ span: 11 }" class="flex-4">
        <a-select size="small" v-decorator="[
          'updateRateType',
          {},
        ]" placeholder="更新频率">
          <a-select-option v-for="item in updateRateTypeMap" :key="item.value" :value="item.value">
            {{ item.label }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item required label="每日" :label-col="{ span: 4, offset }" :wrapper-col="{ span: 20 }"
        class="flex-3 align-c">
        <a-time-picker size="small" v-if="form.getFieldValue('updateRateType') == 1" v-decorator="[
          'day',
          { rules: [{ required: true, message: '' }] },
        ]" format="HH:mm" placeholder="时间" />
        <div class="online-container" v-if="form.getFieldValue('updateRateType') == 2">
          <a-tree-select size="small" style="width: 140px;margin: 0 15px 0 0" :maxTagCount="1" v-decorator="[
            'hour',
            {},
          ]" :tree-data="treeData" tree-checkable placeholder="小时" />
          <a-select size="small" v-decorator="[
            'minute',
            {},
          ]" placeholder="分钟" style="width: 75px;">
            <a-select-option v-for="item in 60" :key="item - 1" :value="item - 1">
              {{ item - 1 }}
            </a-select-option>
          </a-select>
        </div>
      </a-form-item>
    </div>
  </a-form>
</template>

<script>
//导入代码编辑器
const updateTypeMap = [
  {
    label: '手动更新',
    value: 1
  },
  {
    label: '定时更新',
    value: 2
  }
]
const updateRateTypeMap = [
  {
    label: '天级',
    value: 1
  },
  {
    label: '小时级',
    value: 2
  }
]

export default {
  name: 'DataModelUpdateSetting',
  components: {
  },
  data() {
    return {
      updateTypeMap,
      updateRateTypeMap
    }
  },
  model: {
    prop: 'visible',
    event: 'change'
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    treeData() {
      const treeData = [
        {
          title: '全部',
          value: 'all',
          key: '0',
          children: [],
        },
      ]
      for (let i = 0; i < 24; i++) {
        treeData[0].children.push({
          title: i + '',
          value: i + '',
          key: '0-' + i,
        })
      }
      return treeData
    }
  },
  beforeCreate() {
    this.form = this.$form.createForm(this, { name: 'date_model-setting' });
    if (!this.form.getFieldValue("updateCycleType")) {
      this.form.setFieldsValue({ "updateCycleType": 1 })
    }
    if (!this.form.getFieldValue("updateRateType")) {
      this.form.setFieldsValue({ "updateRateType": 1 })
    }
    if (!this.form.getFieldValue("day")) {
      this.form.setFieldsValue({ "day": new Date() })
    }
    if (!this.form.getFieldValue("hour")) {
      this.form.setFieldsValue({ "hour": [] })
    }
    if (!this.form.getFieldValue("minute")) {
      this.form.setFieldsValue({ "minute": "" })
    }
  },
  activated() {
  },
  mounted() {
  },
  destroyed() { },
  methods: {
    setDefaultValue(defaultValue) {
      this.form.setFieldsValue({
        updateCycleType: defaultValue.updateCycleType || 1,
        updateRateType: defaultValue.updateRateType || 1,
        day: defaultValue.day || '',
        hour: defaultValue.hour || [],
        minute: defaultValue.minute || [],
      })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.idm-dm-update-container {
  margin: 20px 0 0 0;

  ::v-deep(.ant-select-tree) {
    max-height: 400px;
  }

}

.online-container {
  display: flex;

  .flex-4 {
    flex: 2;
  }

  .flex-3 {
    flex: 3;
  }

  .align-c {
    display: flex;
    align-items: center;
  }
}
</style>

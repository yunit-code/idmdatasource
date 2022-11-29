<template>
  <a-drawer :visible="visible" :zIndex="1005" ref="dmDrawer" :maskClosable="false" wrapClassName="idm_dm_drawer"
    :body-style="{ padding: '24px 0 80px 0' }" width="750px" :title="drawerTitle || '数据源建模'"
    @close="() => $emit('change', false)">
    <a-spin :spinning="spinning">
      <div class="step-container" :style="{ 'padding': `0 ${steps.length == 3 ? 40 : 120}px` }">
        <a-steps :current="currentStep" size="small" labelPlacement="vertical">
          <a-step v-for="item in steps" :key="item.title" :title="item.title" />
        </a-steps>
      </div>
      <div class="drawer-bottom-class">
        <div>
          <a-button @click="handlePrev">
            上一步
          </a-button>
          <a-button type="primary" @click="handleNext" :disabled="isNextBtnDisabled" v-if="isShowNextBtn">
            下一步
          </a-button>
        </div>
        <div class="idm-bd-progress" v-if="isShowProgress">
          <a-progress :percent="percent" :show-info="false" size="small" :status="progressStatus" />
        </div>
        <div>
          <a-button type="primary" @click="handleTest" v-if="isShowTestBtn">
            {{ spinning ? '测试中' : (defaultValue.type == '1' || defaultValue.type == '3') ? '测试数据' : '测试链接' }}
          </a-button>
          <a-button type="primary" :disabled="isCompleteBtnDisabled" :loading="completeBtnLoading" @click="handleNext"
            v-if="isShowCompleteBtn">
            完成
          </a-button>
        </div>
      </div>
      <div style="height:calc(100vh - 215px);overflow: auto;padding: 0 10px" class="scrollbar_style">
        <!--------------- step 0 --------------- -->
        <a-form layout='horizontal' :form="form" v-show="currentStep === 0">
          <a-input style="display:none" v-decorator="[
            'type',
            {
              initialValue: defaultValue.type,
            }
          ]" />
          <a-input style="display:none" v-decorator="[
            'resultJson',
            {
              initialValue: defaultValue.resultJson,
            }
          ]" />
          <a-collapse :bordered="false" v-model="activeCollapse">
            <a-collapse-panel key="1" forceRender header="基础信息" :style="{ border: 0 }">
              <a-form-item :label-col="formItemLayout.labelCol" :wrapper-col="formItemLayout.wrapperCol">
                <span slot="label">
                  名称
                  <a-tooltip :getPopupContainer="getPopupContainer" title="名称要求">
                    <a-icon type="info-circle" />
                  </a-tooltip>
                </span>
                <a-input placeholder="请输入" v-decorator="[
                  'title',
                  {
                    initialValue: defaultValue.title,
                    rules: [{ required: true, message: '请输入建模名称!' }],
                  }
                ]" />

              </a-form-item>
              <a-form-item label='共享属性' :label-col="formItemLayout.labelCol" :wrapper-col="formItemLayout.wrapperCol">
                <a-radio-group v-decorator="['shareType',
                {
                  initialValue: defaultValue.shareType,
                  rules: [{ required: true, message: '请选择共享属性!' }],
                }]">
                  <a-radio :value="0">
                    私有
                  </a-radio>
                  <a-radio :value="1">
                    共享
                  </a-radio>
                </a-radio-group>
              </a-form-item>
              <a-form-item label='作者' :label-col="formItemLayout.labelCol" :wrapper-col="formItemLayout.wrapperCol">
                <a-input placeholder="请输入" v-decorator="[
                  'author',
                  {
                    initialValue: defaultValue.author,
                    rules: [{ required: true, message: '请输入作者!' }],
                  }
                ]" />
              </a-form-item>
              <a-form-item label='所属分组' :label-col="formItemLayout.labelCol" :wrapper-col="formItemLayout.wrapperCol">
                <a-select :getPopupContainer="getPopupContainer" allowClear dropdownClassName="idm_dev_theme"
                  v-decorator="['groupId',
                  {
                    initialValue: defaultValue.groupId,
                    rules: [{ required: true, message: '请选择分组!' }],
                  }]">
                  <template v-for="(item, index) in ConditionGroup">
                    <a-select-option :key="index" v-if="item.value" :value="item.value">
                      {{ item.value ? item.text : "请选择" }}
                    </a-select-option>
                  </template>
                </a-select>
              </a-form-item>
              <a-form-item label='所属目录'
                :label-col="formItemLayout.labelCol"
                :wrapper-col="formItemLayout.wrapperCol">
                <a-tree-select allowClear
                :tree-data="CodeTreeData"
                :showSearch="true"
                treeNodeFilterProp="title"
              dropdownClassName="idm_dev_theme" :replaceFields="{children:'children', title:'name', key:'id', value: 'id' }" v-decorator="['codeId',
                    {
                      initialValue:defaultValue.codeId,
                      rules: [{ required: true, message: '请选择所属目录!' }],
                    }]">
                </a-tree-select>
              </a-form-item>
              <a-form-item :label-col="formItemLayout.labelCol" :wrapper-col="formItemLayout.wrapperCol">
                <span slot="label">
                  产品标签
                  <a-tooltip :getPopupContainer="getPopupContainer" title="维护数据源所属产品的编号，方便对数据源进行快速的归类和导出，如果属于多个产品可多选">
                    <a-icon type="question-circle-o" />
                  </a-tooltip>
                </span>
                <a-select :getPopupContainer="getPopupContainer" allowClear labelInValue optionFilterProp="children"
                  dropdownClassName="idm_dev_theme" mode="multiple" v-decorator="['productArray',
                  {
                    initialValue: defaultValue.productArray,
                    rules: [],
                  }]">
                  <a-select-option v-for="(item, index) in ConditionProductList" :key="index" :value="item.value">
                    {{ item.value ? item.text : "请选择" }}
                  </a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item label='描述' :label-col="formItemLayout.labelCol" :wrapper-col="formItemLayout.wrapperCol">
                <a-textarea placeholder="请输入" v-decorator="[
                  'remark',
                  {
                    initialValue: defaultValue.remark,
                    rules: [],
                  }
                ]" />
              </a-form-item>
              <a-form-item label="排序" :label-col="formItemLayout.labelCol" :wrapper-col="formItemLayout.wrapperCol">
                <a-input-number placeholder="请输入"
                  v-decorator="['itemIndex', { initialValue: defaultValue.itemIndex || 1 }]" :min="1" :max="10000" />
              </a-form-item>
            </a-collapse-panel>
            <a-collapse-panel v-if="isShowSecondCollapse" key="2" forceRender
              :header="subLabelMap[defaultValue.type] || '信息'" :style="{ border: 0 }">
              <a-tabs default-active-key="1" v-show="defaultValue.type == '1'">
                <a-tab-pane key="1" tab="请求参数" force-render>
                  <div class="ds_form_item" v-for="(element, index) in dataSourceJson('paramJson')" :key="index">
                    <div class="ds_form_item_content">
                      <a-input disabled placeholder="name" v-model="element.name" style="width:150px" />
                      <div> </div>
                      <div style="width:300px;flex-shrink: 0;">
                        <a-switch disabled v-model="element.value" v-if="element.valueType == '1'" />
                        <a-input disabled v-model="element.value" v-else-if="element.valueType == '2'"
                          placeholder="请输入表达式（示例：@[data.value]）" style="width:100%" />
                        <a-input disabled v-model="element.value" v-else placeholder="请输入字符串" style="width:100%" />
                      </div>
                      <a-select :getPopupContainer="getPopupContainer" disabled style="width:100px" allowClear
                        dropdownClassName="idm_dev_theme" v-model="element.valueType" :default-value="0">
                        <a-select-option :value="0">字符串</a-select-option>
                        <a-select-option :value="1">布尔</a-select-option>
                        <a-select-option :value="2">表达式</a-select-option>
                      </a-select>
                    </div>
                  </div>
                  <div v-if="dataSourceJson('paramJson').length === 0" class="empty-text">
                    配置为空
                  </div>
                </a-tab-pane>
                <a-tab-pane key="2" tab="请求头信息" force-render>
                  <div class="ds_form_item" v-for="(element, index) in dataSourceJson('headerJson')" :key="index">
                    <div class="ds_form_item_content">
                      <a-input disabled placeholder="name" v-model="element.name" style="width:150px" />
                      <div> </div>
                      <div style="width:300px;flex-shrink: 0;">
                        <a-switch disabled v-model="element.value" v-if="element.valueType == '1'" />
                        <a-input disabled v-model="element.value" v-else-if="element.valueType == '2'"
                          placeholder="请输入表达式（示例：@[data.value]）" style="width:100%" />
                        <a-input disabled v-model="element.value" v-else placeholder="请输入字符串" style="width:100%" />
                      </div>
                      <a-select :getPopupContainer="getPopupContainer" disabled style="width:100px" allowClear
                        dropdownClassName="idm_dev_theme" v-model="element.valueType" :default-value="0">
                        <a-select-option :value="0">字符串</a-select-option>
                        <a-select-option :value="1">布尔</a-select-option>
                        <a-select-option :value="2">表达式</a-select-option>
                      </a-select>
                    </div>
                  </div>
                  <div v-if="dataSourceJson('headerJson').length === 0" class="empty-text">
                    配置为空
                  </div>
                </a-tab-pane>
              </a-tabs>
              <a-form-item v-if="defaultValue.type == '4'" :label-col="formItemLayoutBottom.labelCol"
                :wrapper-col="formItemLayoutBottom.wrapperCol">
                <span slot="label">
                  请求地址
                  <a-tooltip :getPopupContainer="getPopupContainer" title="内部接口不需要填写ip、domain、projectName，外部接口请填写完整地址">
                    <a-icon type="question-circle-o" />
                  </a-tooltip>
                </span>
                <a-input placeholder="请输入" @change="needTest = true" v-decorator="[
                  'api',
                  {
                    initialValue: defaultValue.api,
                    rules: [{ required: true, message: '请输入请求地址!' }],
                  }
                ]" />
              </a-form-item>
              <a-form-item label='请求方式' v-if="defaultValue.type == '4'" :label-col="formItemLayoutBottom.labelCol"
                :wrapper-col="formItemLayoutBottom.wrapperCol">
                <a-radio-group @change="needTest = true" v-decorator="['requestType',
                {
                  initialValue: defaultValue.requestType,
                  rules: [{ required: true, message: '请选择请求方式!' }],
                }]">
                  <a-radio value="GET">
                    GET
                  </a-radio>
                  <a-radio value="POST">
                    POST
                  </a-radio>
                </a-radio-group>
              </a-form-item>
              <a-form-item v-if="defaultValue.type == '4'" :label-col="formItemLayoutBottom.labelCol"
                :wrapper-col="formItemLayoutBottom.wrapperCol">
                <span slot="label">
                  超时时长(毫秒)
                  <a-tooltip :getPopupContainer="getPopupContainer" title="如果请求时间超过 `超时时长` 的值，则请求会被中断，默认值是 `0` (永不超时)">
                    <a-icon type="question-circle-o" />
                  </a-tooltip>
                </span>
                <a-input-number placeholder="请输入" v-decorator="['timeout', { initialValue: defaultValue.timeout || 0 }]"
                  :min="0" :max="10000000" />
              </a-form-item>
              <a-form-item v-if="defaultValue.type == '4' || defaultValue.type == '2'"
                :label-col="defaultValue.type == '4' ? formItemLayoutBottom.labelCol : defaultValue.type == '2' ? formItemLayout.labelCol : 0"
                :wrapper-col="defaultValue.type == '4' ? formItemLayoutBottom.wrapperCol : defaultValue.type == '2' ? formItemLayout.wrapperCol : 0">
                <span slot="label">
                  {{ defaultValue.type == '2' ? 'SQL参数' : '请求参数' }}
                  <a-tooltip :getPopupContainer="getPopupContainer"
                    :title="(defaultValue.type == '2' ? '请根据SQL语句中的问号数量按需填写参数，否则将执行失败，请注意参数的顺序。' : '请求地址所需要的参数，支持IDM表达式的方式。') + '例如：此处填写(举例url中有abc=123的参数) @[url(\'abc\')+\'---\'+abc]，组件传递了 {abc:4567} ，则这里替换后则为 123---4567'">
                    <a-icon type="question-circle-o" />
                  </a-tooltip>
                </span>
                <a-input style="display:none" v-decorator="[
                  'paramJson',
                  {
                    initialValue: defaultValue.paramJson,
                  }
                ]" />
                <!--propName：paramJson-->
                <draggable tag="div" chosen-class="idmcore-datasource-param-ghost" force-fallback="true" animation="300"
                  v-model="paramJson" group="param" @start="paramSelectDrag = true" @end="paramSelectDrag = false;"
                  handle=".handle">
                  <transition-group>
                    <div class="ds_form_item" v-for="(element, index) in paramJson" :key="index">
                      <div class="ds_form_item_handle">
                        <svg-icon icon-class="listdrag-icon" class="handle" />
                      </div>
                      <div class="ds_form_item_content">
                        <a-input @change="paramChange()" placeholder="name" v-model="element.name"
                          :style="defaultValue.type == '1' ? 'width: 126px' : 'width:90px'" />
                        <div>:</div>
                        <div :style="{ 'flex-shrink': 0, width: defaultValue.type == '1' ? '297px' : '130px' }">
                          <a-switch @change="paramChange()" v-model="element.value" v-if="element.valueType == '1'" />
                          <a-input @change="paramChange()" v-model="element.value" v-else-if="element.valueType == '2'"
                            placeholder="请输入表达式（示例：@[data.value]）" style="width:100%" />
                          <a-input @change="paramChange()" v-model="element.value" v-else placeholder="请输入字符串"
                            style="width:100%" />
                        </div>
                        <a-select :getPopupContainer="getPopupContainer" @change="paramChange()" style="width:100px"
                          allowClear dropdownClassName="idm_dev_theme" v-model="element.valueType" :default-value="0">
                          <a-select-option :value="0">字符串</a-select-option>
                          <a-select-option :value="1">布尔</a-select-option>
                          <a-select-option :value="2">表达式</a-select-option>
                        </a-select>
                        <div @click="deleteListRow('paramJson', index)">
                          <svg-icon icon-class="delete-icon" />
                        </div>
                      </div>
                    </div>
                  </transition-group>
                </draggable>
                <div>
                  <a-button icon="plus" @click="pushNewRow('paramJson')">添加</a-button>
                </div>
              </a-form-item>
              <a-form-item v-if="defaultValue.type == '4'" :label-col="formItemLayoutBottom.labelCol"
                :wrapper-col="formItemLayoutBottom.wrapperCol">
                <span slot="label">
                  请求头信息
                  <a-tooltip :getPopupContainer="getPopupContainer"
                    title="如果参数值为IDM表达式则支持动态获取非固定值。例如：此处填写(举例url中有abc=123的参数) @[url('abc')+'---'+abc]，组件传递了 {abc:4567} ，则这里替换后则为 123---4567">
                    <a-icon type="question-circle-o" />
                  </a-tooltip>
                </span>
                <a-input style="display:none" v-decorator="[
                  'headerJson',
                  {
                    initialValue: defaultValue.headerJson,
                  }
                ]" />
                <!--propName：headerJson-->
                <draggable tag="div" chosen-class="idmcore-datasource-param-ghost" force-fallback="true" animation="300"
                  v-model="headerJson" group="header" @start="paramSelectDrag = true" @end="paramSelectDrag = false;"
                  handle=".handle">
                  <transition-group>
                    <div class="ds_form_item" v-for="(element, index) in headerJson" :key="index">
                      <div class="ds_form_item_handle">
                        <svg-icon icon-class="listdrag-icon" class="handle" />
                      </div>
                      <div class="ds_form_item_content">
                        <a-input placeholder="name" v-model="element.name" style="width:90px" />
                        <div>:</div>
                        <div style="width:130px;flex-shrink: 0;">
                          <a-switch @change="needTest = true" v-model="element.value" v-if="element.valueType == '1'" />
                          <a-input @change="needTest = true" v-model="element.value"
                            v-else-if="element.valueType == '2'" placeholder="请输入表达式（示例：@[data.value]）"
                            style="width:100%" />
                          <a-input @change="needTest = true" v-model="element.value" v-else placeholder="请输入字符串"
                            style="width:100%" />
                        </div>
                        <a-select :getPopupContainer="getPopupContainer" style="width:100px" allowClear
                          dropdownClassName="idm_dev_theme" @change="needTest = true" v-model="element.valueType"
                          :default-value="0">
                          <a-select-option :value="0">字符串</a-select-option>
                          <a-select-option :value="1">布尔</a-select-option>
                          <a-select-option :value="2">表达式</a-select-option>
                        </a-select>
                        <div @click="deleteListRow('headerJson', index)">
                          <svg-icon icon-class="delete-icon" />
                        </div>
                      </div>
                    </div>
                  </transition-group>
                </draggable>
                <div>
                  <a-button icon="plus" @click="pushNewRow('headerJson')">添加</a-button>
                </div>

              </a-form-item>
              <a-form-item :label-col="formItemLayout.labelCol" :wrapper-col="formItemLayout.wrapperCol"
                v-if="defaultValue.type == '2'">
                <span slot="label">
                  驱动名称
                  <a-tooltip :getPopupContainer="getPopupContainer" title="设置要使用的数据库链接驱动名称，如果为空则使用默认的">
                    <a-icon type="question-circle-o" />
                  </a-tooltip>
                </span>
                <a-input placeholder="请输入" @change="needTest = true" v-decorator="[
                  'dbName',
                  {
                    initialValue: defaultValue.dbName,
                  }
                ]" />
              </a-form-item>
              <a-form-item :label-col="formItemLayout.labelCol" :wrapper-col="formItemLayout.wrapperCol"
                v-show="defaultValue.type == '2'">
                <span slot="label">
                  SQL语句
                  <a-tooltip :getPopupContainer="getPopupContainer"
                    title="sql语句支持表达式和参数的方式，一般情况不建议在此处使用表达式进行替换，建议使用参数的方式">
                    <a-icon type="question-circle-o" />
                  </a-tooltip>
                </span>
                <a-input style="display:none" v-decorator="[
                  'dbSql',
                  {
                    initialValue: defaultValue.dbSql,
                  }
                ]" />
                <!--propName：dbSql-->
                <div class="monacoeditor-box" v-if="defaultValue.type == '2'" style="height:200px;">
                  <MonacoEditor ref="resultSql" :lineNumbersMinChars="1" :language="`sql`" @mounted="sqlEditorLoaded"
                    @codeChange="transformAllContentToForm('resultSql')"></MonacoEditor>
                </div>
              </a-form-item>

              <a-form-item v-if="defaultValue.type == '3'" :label-col="{ span: 0 }" :wrapper-col="{ span: 24 }">
                <a-upload list-type="text" accept=".xls,.xlsx" @preview="handlePreview"
                  :customRequest="(file) => uploadFileHandle(file, 'file_name')"
                  @change="(file) => uploadFileChange(file, 'file_name')" v-decorator="[
                    'file_name',
                    {
                      initialValue: defaultValue.file_name,
                      valuePropName: 'fileList',
                      rules: [{ required: true, message: '请上传附件!' }],
                    },
                  ]">
                  <a-button>
                    <a-icon type="upload" /> 点击上传
                  </a-button>
                  <span style="color:999;font-size: 12px;margin: 10px 0 0 10px;">支持.xlsx,.xls格式</span>
                </a-upload>
              </a-form-item>
            </a-collapse-panel>
            <a-collapse-panel v-if="isShowBottomCollapse" key="3" forceRender>
              <template #header>
                请求参数
                <a-tooltip :getPopupContainer="getPopupContainer"
                  :title="((defaultValue.dataSource && defaultValue.dataSource.type == '2') ? '请根据SQL语句中的问号数量按需填写参数，否则将执行失败，请注意参数的顺序。' : '请求地址所需要的参数，支持IDM表达式的方式。') + '例如：此处填写(举例url中有abc=123的参数) @[url(\'abc\')+\'---\'+abc]，组件传递了 {abc:4567} ，则这里替换后则为 123---4567'">
                  <a-icon type="question-circle-o" />
                </a-tooltip>
              </template>
              <a-form-item label="" :colon="false" :label-col="0" :wrapper-col="0">
                <a-input style="display:none" v-decorator="[
                  'paramJson',
                  {
                    initialValue: defaultValue.paramJson,
                  }
                ]" />
                <!--propName：paramJson-->
                <draggable tag="div" chosen-class="idmcore-datasource-param-ghost" force-fallback="true" animation="300"
                  v-model="paramJson" group="param" @start="paramSelectDrag = true" @end="paramSelectDrag = false;"
                  handle=".handle">
                  <transition-group>
                    <div class="ds_form_item" v-for="(element, index) in paramJson" :key="index">
                      <div class="ds_form_item_handle">
                        <svg-icon icon-class="listdrag-icon" class="handle" />
                      </div>
                      <div class="ds_form_item_content">
                        <a-input @change="paramChange()" placeholder="name" v-model="element.name"
                          style="width: 126px" />
                        <div>:</div>
                        <div :style="{ 'flex-shrink': 0, width: '297px' }">
                          <a-switch @change="paramChange()" v-model="element.value" v-if="element.valueType == '1'" />
                          <a-input @change="paramChange()" v-model="element.value" v-else-if="element.valueType == '2'"
                            placeholder="请输入表达式（示例：@[data.value]）" style="width:100%" />
                          <a-input @change="paramChange()" v-model="element.value" v-else placeholder="请输入字符串"
                            style="width:100%" />
                        </div>
                        <a-select :getPopupContainer="getPopupContainer" @change="paramChange()" style="width:100px"
                          allowClear dropdownClassName="idm_dev_theme" v-model="element.valueType" :default-value="0">
                          <a-select-option :value="0">字符串</a-select-option>
                          <a-select-option :value="1">布尔</a-select-option>
                          <a-select-option :value="2">表达式</a-select-option>
                        </a-select>
                        <div @click="deleteListRow('paramJson', index)">
                          <svg-icon icon-class="delete-icon" />
                        </div>
                      </div>
                    </div>
                  </transition-group>
                </draggable>
                <div>
                  <a-button icon="plus" @click="pushNewRow('paramJson')">添加参数</a-button>
                </div>
              </a-form-item>
            </a-collapse-panel>
          </a-collapse>
        </a-form>
        <!--------------- step 1 --------------- -->
        <DataModelResultParse ref="dataModelResultParse" v-show="currentStep === 1">
        </DataModelResultParse>
        <!--------------- step 2 --------------- -->
        <DataModelUpdateSetting ref="dataModelUpdateSetting" v-show="currentStep === 2"></DataModelUpdateSetting>
      </div>
    </a-spin>
  </a-drawer>
</template>

<script>
//导入代码编辑器
import MonacoEditor from "@/plugins/vscode/monacoEditor.vue";
import DataModelUpdateSetting from './DataModelUpdateSetting'
import DataModelResultParse from './DataModelResultParse'
import moment from 'moment'
import apis from '../api/dataModalUrls'
const steps = [
  {
    title: '模型基础',
  },
  {
    title: '解析数据',
  },
  {
    title: '同步设置',
  },
]
const subLabelMap = {
  1: '数据源参数预览',
  2: 'SQL信息',
  3: '附件信息',
  4: '接口信息'
}
export default {
  name: 'DataModelDrawer',
  components: {
    MonacoEditor,
    DataModelUpdateSetting,
    DataModelResultParse
  },
  data() {
    return {
      subLabelMap,
      currentStep: 0,
      paramEdit: false,
      activeCollapse: ['1', '2', '3'],
      intelfaceDebugVisible: false,
      paramJson: [],
      headerJson: [],
      fileList: [],
      paramSelectDrag: false,
      paramJson_debug: [],
      headerJson_debug: [],
      spinning: false,
      completeBtnLoading: false,
      resultData: [],
      formItemLayout: {
        labelCol: { span: 4 },
        wrapperCol: { span: 20 }
      },
      formItemLayoutBottom: {
        labelCol: { span: 6 },
        wrapperCol: { span: 18 }
      },
      percent: 0,
      progressStatus: 'active',
      isShowProgress: false,
      needTest: true,
      CodeTreeData:[],
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
    },
    defaultValue: {
      type: Object
    },
    ConditionGroup: {
      type: Array,
      default: () => []
    },
    ConditionType: {
      type: Array,
      default: () => []
    },
    ConditionModuleList: {
      type: Array,
      default: () => []
    },
    ConditionProductList: {
      type: Array,
      default: () => []
    }
  },
  beforeCreate() {
    this.form = this.$form.createForm(this, { name: 'form_in_modal_ds' });
  },
  created() {
    let that = this;
    //所属目录
    if (
      !IDM.develop.cacheData.DataModelDirectoryTree
    ) {
      IDM.http.get("ctrl/idm/code/getCodeTree?codeIds=221129152417rZZZVoEfzket0xgX47s").then((res) => {
        let resultData = [];
        if (res.data.code == 200) {
          resultData = res.data.data.codeList;
        }
        IDM.develop.cacheData.DataModelDirectoryTree = resultData;
        that.CodeTreeData = resultData;
      });
    } else {
      this.CodeTreeData = IDM.develop.cacheData.DataModelDirectoryTree;
    }
  },
  activated() {
  },
  mounted() {
    if (!this.form.getFieldValue("type")) {
      this.form.setFieldsValue({ "type": "1" })
    }
    if (!this.form.getFieldValue("shareType")) {
      this.form.setFieldsValue({ "shareType": 1 })
    }
    if (!this.form.getFieldValue("remark")) {
      this.form.setFieldsValue({ "remark": "" })
    }
    if (!this.form.getFieldValue("groupId")) {
      this.form.setFieldsValue({ "groupId": "" })
    }
    if (!this.form.getFieldValue("codeId")) {
      this.form.setFieldsValue({ "codeId": "" })
    }
    if (!this.form.getFieldValue("title")) {
      this.form.setFieldsValue({ "title": "" })
    }
    if (!this.form.getFieldValue("author")) {
      this.form.setFieldsValue({ "author": "" })
    }
    if (!this.form.getFieldValue("productArray")) {
      this.form.setFieldsValue({ "productArray": [] })
    }
    if (!this.form.getFieldValue("api")) {
      this.form.setFieldsValue({ "api": "" })
    }
    if (!this.form.getFieldValue("requestType")) {
      this.form.setFieldsValue({ "requestType": "GET" })
    }
    if (!this.form.getFieldValue("timeout")) {
      this.form.setFieldsValue({ "timeout": 0 })
    }
    if (!this.form.getFieldValue("itemIndex")) {
      this.form.setFieldsValue({ "itemIndex": 1 })
    }
    if (!this.form.getFieldValue("resultJson")) {
      this.form.setFieldsValue({ "resultJson": "" })
    }
    if (!this.form.getFieldValue("dbName")) {
      this.form.setFieldsValue({ "dbName": "" })
    }
    if (!this.form.getFieldValue("dbSql")) {
      this.form.setFieldsValue({ "dbSql": "SELECT" })
    }
    if (!this.form.getFieldValue("file_name")) {
      this.form.setFieldsValue({ "file_name": [] })
    }
    if (this.defaultValue.type == '2') {
      this.sqlEditorLoaded(true);
    }
  },
  computed: {
    drawerTitle() {
      return this.ConditionType.find(el => el.value == this.defaultValue.type)?.text || '模型信息'
    },
    steps() {
      const showStep = _.cloneDeep(steps)
      if (this.defaultValue.type == '3') {
        showStep.length = 2
        return showStep
      }
      return steps
    },
    isNextBtnDisabled() {
      if (this.currentStep === 1) {
        // "[]" 为空不能下一步
        return this.$refs['dataModelResultParse']?.getParams()?.dataTableListJson?.length == 2
      }
      if (this.currentStep === 0 && this.needTest) {
        return true
      }
      return false
    },
    isShowSecondCollapse() {
      if (this.defaultValue.type == '1') {
        if ([2, 3, 5].includes(this.defaultValue?.dataSource?.type)) {
          return false
        }
      }
      return true
    },
    isShowBottomCollapse() {
      if (this.defaultValue.type == '1') {
        if ([1, 4].includes(this.defaultValue?.dataSource?.type)) {
          return true
        }
      }
      return false
    },
    isShowNextBtn() {
      // excel 只有两步
      if (this.currentStep === 1 && this.defaultValue.type == 3) {
        return false
      }
      if (this.currentStep !== 2) {
        return true
      }
      return false
    },
    isCompleteBtnDisabled() {
      if (this.currentStep === 1) {
        // "[]" 为空不能下一步
        return this.$refs['dataModelResultParse']?.getParams()?.dataTableListJson?.length == 2
      }
      return false
    },
    isShowCompleteBtn() {
      // excel 只有两步
      if (this.currentStep === 1 && this.defaultValue.type == 3) {
        return true
      }
      if (this.currentStep === 2) {
        return true
      }
      return false
    },
    isShowTestBtn() {
      if (this.currentStep === 0) {
        return true
      }
      return false
    },
  },
  destroyed() { },
  methods: {
    getPopupContainer() {
      return document.getElementsByClassName('ant-drawer-content-wrapper')[0]
    },
    dataSourceJson(paramJson) {
      let arr = []
      try {
        arr = this.defaultValue?.dataSource && JSON.parse(this.defaultValue?.dataSource[paramJson]) || []
      } catch (error) {
        arr = []
      }
      return arr
    },
    handlePrev() {
      this.currentStep--
      if (this.currentStep === -1) {
        this.currentStep = 0
        this.$emit('change', false)
      }
    },
    handleComplete() {
      this.completeBtnLoading = true
      apis.requestSaveDataModel(this.handleGetParams()).then(res => {
        if (res.data.code == 200) {
          this.$emit('change', false)
          this.$emit('handleComplete')
          IDM.message.success(res.data.message)
        } else {
          IDM.message.error(res?.data?.message || '保存失败')
        }
      }).finally(() => {
        this.completeBtnLoading = false
      })
    },
    handleNext() {
      switch (this.currentStep) {
        case 0:
          // 第一步表单
          this.form.validateFields((err, values) => {
            if (!err) {
              this.completeBtnLoading = false
              this.currentStep++
            }
          });
          break
        case 1:
          if (this.defaultValue.type == 3) {
            this.handleComplete()
          } else {
            this.completeBtnLoading = false
            this.currentStep++
          }
          break
        case 2:
          // 最后一步表单
          this.$refs['dataModelUpdateSetting'].form.validateFields((err, values) => {
            if (!err) {
              this.handleComplete()
            }
          });
          break
        default:
          this.currentStep++
      }
    },
    handleGetParams() {
      const params = {
        dataSourceId: this.defaultValue?.dataSourceId ? this.defaultValue.dataSourceId : null,
        dataSourceText: this.defaultValue?.dataSourceText ? this.defaultValue.dataSourceText : null,
        ...this.form.getFieldsValue(),
        ...this.$refs['dataModelResultParse'].getParams(),
        ...this.$refs['dataModelUpdateSetting'].form.getFieldsValue(),
        day: moment(this.$refs['dataModelUpdateSetting'].form?.getFieldValue('day')).format('YYYY-MM-DD HH:mm:ss'),
        hour: this.$refs['dataModelUpdateSetting'].form?.getFieldValue('hour')?.join(','),
        fileName: this.form?.getFieldValue('file_name')?.[0]?.name ? this.form.getFieldValue('file_name')[0].name : null,
        fileContent: this.form?.getFieldValue('file_name')?.[0]?.content ? this.form.getFieldValue('file_name')[0].content : null,
        type: this.defaultValue.type,
        id: this.defaultValue.id ? this.defaultValue.id : null
      }
      delete params['file_name'] // 后端不区分file_name fileName
      return params
    },
    // 测试数据
    handleTest() {
      this.isShowProgress = true
      this.spinning = true
      this.percent = 1
      this.progressStatus = 'active'
      apis.requestAnalysisJson(this.handleGetParams()).then(res => {
        if (res.status == 200 && res.data.code == 200) {
          IDM.message.success(res.data.message)
          this.progressStatus = 'success'
          this.$refs['dataModelResultParse'].setTableData(res.data.data || [])
          this.needTest = false
        } else {
          IDM.message.error(res?.data?.message || '测试失败')
          this.progressStatus = 'exception'
        }
      }).catch(err => {
        IDM.message.error('测试失败')
        this.progressStatus = 'exception'
      }).finally(() => {
        this.percent = 100
        this.spinning = false
        this.needTest = false
      })
      // 跑进度
      let timer = setInterval(() => {
        if (this.percent == 100) return clearInterval(timer)
        this.percent++
        if (this.percent == 90) {
          clearInterval(timer)
          timer = setInterval(() => {
            if (this.percent == 100) return clearInterval(timer)
            this.percent++
            if (this.percent == 98) {
              clearInterval(timer)
            }
          }, 60)
        }
      }, 20)
    },
    // 请求参数变化
    paramChange() {
      this.paramEdit = true;
      this.needTest = true
    },
    // 文件下载
    handlePreview(file) {
      if (file.content) {
        const elink = document.createElement('a');
        elink.download = file.name;
        elink.style.display = 'none';
        const blob = new Blob([file.content], { type: 'application/' + file.name.split(".")[file.name.split(".").length - 1] });
        const href = URL.createObjectURL(blob);
        elink.href = href;
        document.body.appendChild(elink);
        elink.click();
        document.body.removeChild(elink);
        window.URL.revokeObjectURL(href);
      } else {
        window.open(IDM.url.getWebPath(file.src));
      }
    },
    // 删除行
    deleteListRow(name, index) {
      if (name == "paramJson") {
        this.paramEdit = true;
      }
      this[name].splice(index, 1);
      // this.$forceUpdate();
      this.form.setFieldsValue({ [name]: JSON.stringify(this[name]) });
    },
    // 添加行
    pushNewRow(name) {
      if (name == "paramJson") {
        this.paramEdit = true;
      }
      this[name].push({ name: "", value: "", valueType: 0 })

      this.form.setFieldsValue({ [name]: JSON.stringify(this[name]) });
    },
    //code改变要设置到form中
    transformAllContentToForm(propName) {
      this.needTest = true
      // <!--propName：dbSql-->
      let dbSql = this.$refs.resultSql && this.$refs.resultSql.getContent();
      "resultSql" == propName ? this.changeSetFormValue("dbSql", dbSql, 0) : null;
    },
    /**
     * json格式的静态数据 
     */
    sqlEditorLoaded(reset) {
      let v = this.defaultValue.isEditInfo ? (reset === true ? this.defaultValue.dbSql : this.form.getFieldValue("dbSql")) : this.form.getFieldValue("dbSql");
      this.$refs.resultSql && this.$refs.resultSql.setContent(v);
    },
    /**
     * vscode布局重置
     */
    editorLayoutReset() {
      this.$nextTick(function (params) {
        this.$refs.editor && this.$refs.editor.layout();
      });
    },
    /**
     * 文件状态改变
     */
    uploadFileChange({ file, fileList }, formKey) {
      let selectList = this.form.getFieldValue(formKey) || [];
      this.fileList = fileList;
      if (file && file.status == "removed") {
        selectList && selectList.forEach((fitem, index) => {
          const isExists = fileList.filter(item => item.uid == fitem.uid);
          if (!isExists || (isExists && isExists.length == 0)) {
            selectList.splice(index, 1)
          }
        })
        this.changeSetFormValue(formKey, selectList);
      }
    },
    /**
     * 上传附件处理函数
     */
    uploadFileHandle(file, formKey) {
      console.log("🚀 ~ file: IControlSettingPanel.vue ~ line 736 ~ uploadFileHandle ~ file", file)
      this.needTest = true
      let that = this;
      let newObject = {
        uid: new Date().getTime() + IDM.uuid(),
        name: file.file.name,
        status: 'uploading',
        // url: IDM.url.getWebPath(resultData.filePath),
      }
      let selectedList = [];
      selectedList.push(newObject);
      that.changeSetFormValue(formKey, selectedList);
      let customParam = { ...IDM.setting.webRoot, getFileContent: 1 };
      IDM.http.upload(IDM.setting.api.uploadFileServerUrl, file.file, customParam).then(res => {
        let resultData = res.data.data;
        /**
         * 返回结果：
         * {
         * fileName: "tab设置.png"
         * filePath: "/upload/idmfiles\f22081da-9410-40bc-afa0-6b3106c45c1c.png"
         * fileSize: "218KB"
         * }
         */
        // console.log("上传数据结果",resultData);
        newObject.status = "done";
        newObject.url = IDM.url.getWebPath(resultData.filePath);
        newObject.ourl = resultData.filePath;
        //方便其他地方使用
        newObject.src = newObject.ourl;
        newObject.size = resultData.fileSize;
        newObject.width = resultData.imageWidth;
        newObject.height = resultData.imageHeight;
        newObject.content = resultData.fileContent;
        // this.spinning = !this.spinning;
        that.changeSetFormValue(formKey, selectedList);

        // this.idm_$message.success(`${file.file.name} 上传成功.`);
      }).catch(err => {
        // this.idm_$message.error(`${file.file.name} 上传失败.`);
        newObject.status = "error";
      });
    },
    changeSetFormValue(formKey, selectedList, delay = 10) {
      var setParam = {};
      setParam[formKey] = _.cloneDeep(selectedList);
      let that = this;
      //延迟设置，不然点击内部的删除无法实现重新设置
      setTimeout(() => {
        that.form.setFieldsValue(setParam);
      }, delay);
    }
  },
  watch: {
    visible: {
      handler(newV) {
        if (newV) {
          this.activeCollapse = ['1', '2', '3']
          this.currentStep = 0
          this.isShowProgress = false
        }
      }
    },
    defaultValue: {
      handler(newV) {
        console.log(newV)
        //type   title   shareType   author   remark   groupId   api   requestType    dbName   dbSql   file_name
        const productArray = []
        if (newV.productIds) {
          let productids = newV.productIds.split(","), productnames = newV.productNames.split(",");
          for (let index = 0; index < productids.length; index++) {
            const element = productids[index];
            productArray.push({ key: element, label: productnames[index] });
          }
        }
        this.$nextTick(() => {
          this.form.setFieldsValue({
            "type": newV.type || "2",
            "title": newV.title || "",
            "author": newV.author || "",
            "remark": newV.remark || "",
            "groupId": newV.groupId || "",
            "codeId": newV.codeId || "",
            "shareType": newV.shareType || 1,
            "productArray": productArray,
            "api": newV.api || "",
            "requestType": newV.requestType || "GET",
            "timeout": newV.timeout || 0,
            "itemIndex": newV.itemIndex || 1,
            "dbName": newV.dbName || "",
            "dbSql": newV.dbSql || "SELECT ",
            "file_name": newV.fileName && [{
              "uid": IDM.uuid(),
              name: newV.fileName,
              "status": "done",
              "content": newV.fileContent,
              "src": newV.fileName
            }] || [],
            "resultJson": newV.resultJson || ""
          })
          // console.log(this.form.getFieldsValue('type'))
          this.paramJson = newV.paramJson ? JSON.parse(newV.paramJson) : [];
          this.headerJson = newV.headerJson ? JSON.parse(newV.headerJson) : [];
          if (newV.type == '1' && newV.isEditInfo != 1) {
            this.paramJson = newV?.dataSource?.paramJson && JSON.parse(newV.dataSource.paramJson) || []
          }
          if (newV.isEditInfo) {
            this.$refs['dataModelResultParse']?.setDefaultValue(newV)
            this.$refs['dataModelUpdateSetting']?.setDefaultValue(newV)
            // 不用测试
            setTimeout(() => {
              this.needTest = false
            }, 500)
          }
        })
      },
      deep: true,
    },
    paramJson: {
      handler() {
        this.$nextTick(() => {
          this.form.setFieldsValue({
            "paramJson": JSON.stringify(this.paramJson),
          })
        })
      },
      deep: true,
    },
    headerJson: {
      handler() {
        this.$nextTick(() => {
          this.form.setFieldsValue({
            "headerJson": JSON.stringify(this.headerJson),
          })

        })
      },
      deep: true,
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.idm_dm_drawer {
  .idm-ant-tag {
    margin-bottom: 5px;
    background: transparent;
  }

  .monacoeditor-box {
    box-sizing: content-box;
    border-width: 1px;
    border-style: solid;
    border-color: #d9d9d9;
  }

  ::v-deep(.ant-collapse-header) {
    background: #fff !important;
  }

  ::v-deep(.ant-collapse-borderless) {
    background: transparent !important;
  }

  ::v-deep(.ant-collapse-content) {
    margin: 0 20px;
    background: #fafafa !important;
  }

  ::v-deep(.ant-drawer-body) {
    padding: 24px 10px;
  }

  ::v-deep(.ant-steps-item-title) {
    font-size: 16px;
  }

  ::v-deep(.ant-collapse-header) {
    font-size: 15px;
  }

  ::v-deep(.ant-form-item) {
    margin-bottom: 6px;
  }

  .empty-text {
    text-align: center;
    color: #999;
    padding: 5px;
  }

  .drawer-bottom-class {
    display: flex;
    justify-content: space-between;
    overflow: hidden;
    position: absolute;
    right: 0;
    bottom: -80px;
    width: 100%;
    border-top: 1px solid #e9e9e9;
    padding: 10px;
    background: #fff;
    text-align: right;
    z-index: 1;

    .idm-bd-progress {
      flex: 1;
      width: 104%;
      position: absolute;
      bottom: -8px;
      margin: 0 0 0 -12px;

      ::v-deep(.ant-progress-bg) {
        height: 3px !important;
      }
    }

    ::v-deep(.ant-btn) {
      margin: 5px;
      border-radius: 2px;
    }
  }

  .ds_form_item {
    display: flex;
    align-items: center;

    .ds_form_item_handle {
      padding: 0px 10px 0 0;
    }

    .ds_form_item_content {
      display: flex;
      align-items: center;

      &>* {
        margin-right: 10px;

        &:last-child {
          cursor: pointer;
          opacity: 0.8;

          &:hover {
            opacity: 1;
          }
        }
      }
    }

    .handle {
      cursor: ns-resize;
    }
  }

  .idmcore-datasource-param-ghost {
    opacity: 0.5;
    background: #d9d9d9 !important;
  }

  .idmcore-datasource-debugbox {
    display: flex;
    justify-content: space-between;
    height: 60vh;

    .idd-title {
      font-weight: bold;
      // font-size: 16px;
      margin-bottom: 10px;
    }

    .ds_form_item {
      margin-bottom: 10px;
    }
  }

  .ds_form_item {
    display: flex;
    align-items: center;
    margin: 0 0 10px 0;

    .ds_form_item_handle {
      padding: 0px 10px 0 0;
    }

    .ds_form_item_content {
      display: flex;
      align-items: center;

      &>* {
        margin-right: 10px;

        &:last-child {
          cursor: pointer;
          opacity: 0.8;

          &:hover {
            opacity: 1;
          }
        }
      }
    }

    .handle {
      cursor: ns-resize;
    }
  }

  .scrollbar_style {
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
}
</style>

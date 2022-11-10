<template>
  <a-modal
      :visible="visible"
      wrapClassName="idm_datasource_preview_modal" 
      :bodyStyle="{'padding':0}"
      :centered="true"
      width="800px"
      :title="defaultValue.isEditInfo?'修改数据源':'创建数据源'"
      okText='保存'
      cancelText='取消'
      @cancel="() => { $emit('cancel') }"
      @ok="() => { $emit('create') }"
    >
      <div slot="footer" style="display:flex;justify-content: space-between;">
        <a-button key="debug" @click="debugDataSource">
          调试
        </a-button>
        <div>
          <a-button key="back" @click="() => { $emit('cancel') }">
            取消
          </a-button>
          <a-button key="submit" type="primary" @click="() => { $emit('create') }">
            保存
          </a-button>
        </div>
      </div>
      <div style="height:80vh;overflow: auto;padding:20px" class="scrollbar_style">
        
      <a-form layout='horizontal' :form="form">
        <a-form-item label='数据源类型'
          :label-col="formItemLayout.labelCol"
          :wrapper-col="formItemLayout.wrapperCol">
          <a-select allowClear @change="typeChange"
        dropdownClassName="idm_dev_theme" v-decorator="['type',
              {
                initialValue:defaultValue.type,
                rules: [{ required: true, message: '请选择类型!' }],
              }]">
              <template 
                  v-for="(item, index) in ConditionType">
                <a-select-option
                  :key="index"
                  v-if="item.value"
                  :value="item.value"
                >
                  {{ item.value?item.text:"请选择" }}
                </a-select-option>
              </template>
          </a-select>
        </a-form-item>
        <a-form-item label='数据源名称'
          :label-col="formItemLayout.labelCol"
          :wrapper-col="formItemLayout.wrapperCol">
          <a-input
            placeholder="请输入"
            v-decorator="[
              'title',
              {
                initialValue:defaultValue.title,
                rules: [{ required: true, message: '请输入名称!' }],
              }
            ]"
          />
        </a-form-item>
        <a-form-item label='共享属性'
          :label-col="formItemLayout.labelCol"
          :wrapper-col="formItemLayout.wrapperCol">
          <a-radio-group v-decorator="['shareType',
              {
                initialValue:defaultValue.shareType,
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
        <a-form-item label='作者'
          :label-col="formItemLayout.labelCol"
          :wrapper-col="formItemLayout.wrapperCol">
          <a-input
            placeholder="请输入"
            v-decorator="[
              'author',
              {
                initialValue:defaultValue.author,
                rules: [{ required: true, message: '请输入作者!' }],
              }
            ]"
          />
        </a-form-item>
        <a-form-item label='描述'
          :label-col="formItemLayout.labelCol"
          :wrapper-col="formItemLayout.wrapperCol">
          <a-textarea
            placeholder="请输入"
            v-decorator="[
              'remark',
              {
                initialValue:defaultValue.remark,
                rules: [],
              }
            ]"
          />
        </a-form-item>
        <a-form-item label='所属分组'
          :label-col="formItemLayout.labelCol"
          :wrapper-col="formItemLayout.wrapperCol">
          <a-select allowClear
        dropdownClassName="idm_dev_theme" v-decorator="['groupId',
              {
                initialValue:defaultValue.groupId,
                rules: [{ required: true, message: '请选择分组!' }],
              }]">
              <template 
                  v-for="(item, index) in ConditionGroup">
                <a-select-option
                  :key="index"
                  v-if="item.value"
                  :value="item.value"
                >
                  {{ item.value?item.text:"请选择" }}
                </a-select-option>
              </template>
          </a-select>
        </a-form-item>
        <a-form-item 
          :label-col="formItemLayout.labelCol"
          :wrapper-col="formItemLayout.wrapperCol">
          <span slot="label">
            产品标签
            <a-tooltip title="维护数据源所属产品的编号，方便对数据源进行快速的归类和导出，如果属于多个产品可多选">
              <a-icon type="question-circle-o" />
            </a-tooltip>
          </span>
          <a-select allowClear labelInValue optionFilterProp="children"
        dropdownClassName="idm_dev_theme"
        :mode="'multiple'" v-decorator="['productArray',
              {
                initialValue:defaultValue.productArray,
                rules: [],
              }]">
              <a-select-option
                  v-for="(item, index) in ConditionProductList"
                  :key="index"
                  :value="item.value"
                >
                  {{ item.value?item.text:"请选择" }}
                </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item 
          :label-col="formItemLayout.labelCol"
          :wrapper-col="formItemLayout.wrapperCol">
          <span slot="label">
            适配组件
            <a-tooltip title="选择此数据源适配的组件可以在组件配置数据源的时候快速选择到你配置的数据源，选择适配组件会自动把所需要的参数带过来(如果有的话)，选择多个只会使用最后一个组件的参数，如参数手动变更过则不会再应用适配组件的自带参数">
              <a-icon type="question-circle-o" />
            </a-tooltip>
          </span>
          <a-select allowClear labelInValue optionFilterProp="children"
        dropdownClassName="idm_dev_theme"
        :mode="'multiple'" @change="moduleChange" v-decorator="['moduleArray',
              {
                initialValue:defaultValue.moduleArray,
                rules: [],
              }]">
              
              <template v-if="ConditionModuleList&&ConditionModuleList.length&&ConditionModuleList[0].groupId">
                <a-select-opt-group v-for="(item,index) in ConditionModuleList" :key="index" :label="item.groupTitle">
                  <a-select-option
                    v-for="(sitem, sindex) in item.componentList"
                    :key="sindex"
                    :value="sitem.value||sitem.comId"
                  >
                    {{ sitem.text||sitem.asName }}
                  </a-select-option>
                </a-select-opt-group>
              </template>
              <template v-else>
                <a-select-option
                  v-for="(item, index) in ConditionModuleList"
                  :key="index"
                  :value="item.value"
                >
                  {{ item.value?item.text:"请选择" }}
                </a-select-option>
              </template>
          </a-select>
          <div v-if="form.getFieldValue('moduleArray')&&form.getFieldValue('moduleArray').length>0" style="line-height: initial;">
            已选择{{form.getFieldValue('moduleArray').length}}个组件，点击查看组件的<a @click="openModuleIntelfaceInfo()">接口描述</a>
          </div>
        </a-form-item>
        <a-form-item 
          :label-col="formItemLayout.labelCol"
          :wrapper-col="formItemLayout.wrapperCol">
          <span slot="label">
            标签
            <a-tooltip title="选择或输入返回结果中有哪些关键词，通过关键词可以在选择的时候能快速选到组件想要的数据源">
              <a-icon type="question-circle-o" />
            </a-tooltip>
          </span>
          <a-select allowClear
        dropdownClassName="idm_dev_theme"
        :mode="'tags'" v-decorator="['tags',
              {
                initialValue:defaultValue.tags,
                rules: [],
              }]">
                <a-select-option v-for="item in tagsList"
                  :key="item"
                >
                  {{ item }}
                </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="排序"
          :label-col="formItemLayout.labelCol"
          :wrapper-col="formItemLayout.wrapperCol">
          <a-input-number placeholder="请输入" v-decorator="['itemIndex', { initialValue: defaultValue.itemIndex||1 }]" :min="1" :max="10000" />
        </a-form-item>
        
        <a-form-item 
          :label-col="formItemLayout.labelCol"
          :wrapper-col="formItemLayout.wrapperCol">
          <span slot="label">
            刷新标识
            <a-tooltip title="在此处维护数据源的刷新标识可以使组件实现局部刷新，此处维护的就是局部刷新的标识，配合websocket使用。">
              <a-icon type="question-circle-o" />
            </a-tooltip>
          </span>
          <a-input
            style="display:none"
            v-decorator="[
              'refreshJson',
              {
                initialValue:defaultValue.refreshJson,
              }
            ]"
          />
          <!--propName：refreshJson-->
          <draggable
           tag="div" 
           chosen-class="idmcore-datasource-param-ghost"
           force-fallback="true" 
           animation="300" 
           v-model="refreshJson" 
           group="refresh" 
           @start="paramSelectDrag = true"
           @end="paramSelectDrag = false;"
           handle=".handle">
            <transition-group>
              <div class="ds_form_item" v-for="(element,index) in refreshJson" :key="index">
                <div class="ds_form_item_handle">
                  <svg-icon icon-class="listdrag-icon" class="handle"/>
                </div>
                <div class="ds_form_item_content">
                  <a-input placeholder="请输入标识(key)" v-model="element.key" style="width:130px"/>
                  <div>&nbsp;</div>
                  <div style="width:400px;flex-shrink: 0;">
                    <a-input v-model="element.desc" placeholder="请输入标识说明" style="width:100%"/>
                  </div>
                  <div @click="deleteListRow('refreshJson',index)">
                    <svg-icon icon-class="delete-icon"/>
                  </div>
                </div>
              </div>
            </transition-group>
          </draggable>
          <div>
            <a-button icon="plus" @click="pushNewRow('refreshJson')">添加</a-button>
          </div>

        </a-form-item>


        <a-form-item 
        v-if="form.getFieldValue('type')=='1'"
          :label-col="formItemLayout.labelCol"
          :wrapper-col="formItemLayout.wrapperCol">
          <span slot="label">
            加载类型
            <a-tooltip title="内部接口建议选择前端请求，如果由客户端无法访问到维护的[请求地址]或不支持跨域则建议使用后端转发请求">
              <a-icon type="question-circle-o" />
            </a-tooltip>
          </span>
          <a-radio-group v-decorator="['loadType',
              {
                initialValue:defaultValue.loadType,
                rules: [{ required: true, message: '请选择加载类型!' }],
              }]">
            <a-radio value="0">
              前端请求
            </a-radio>
            <a-radio value="1">
              后端转发请求
            </a-radio>
        </a-radio-group>
        </a-form-item>
        <a-form-item
        v-if="form.getFieldValue('type')=='1'"
          :label-col="formItemLayout.labelCol"
          :wrapper-col="formItemLayout.wrapperCol">
          <span slot="label">
            请求地址
            <a-tooltip title="内部接口不需要填写ip、domain、projectName，外部接口请填写完整地址">
              <a-icon type="question-circle-o" />
            </a-tooltip>
          </span>
          <a-input
            placeholder="请输入"
            v-decorator="[
              'api',
              {
                initialValue:defaultValue.api,
                rules: [{ required: true, message: '请输入请求地址!' }],
              }
            ]"
          />
        </a-form-item>
        <a-form-item label='请求方式'
        v-if="form.getFieldValue('type')=='1'"
          :label-col="formItemLayout.labelCol"
          :wrapper-col="formItemLayout.wrapperCol">
          <a-radio-group v-decorator="['requestType',
              {
                initialValue:defaultValue.requestType,
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
        <a-form-item
        v-if="form.getFieldValue('type')=='1'"
          :label-col="formItemLayout.labelCol"
          :wrapper-col="formItemLayout.wrapperCol">
          <span slot="label">
            超时时长(毫秒)
            <a-tooltip title="如果请求时间超过 `超时时长` 的值，则请求会被中断，默认值是 `0` (永不超时)">
              <a-icon type="question-circle-o" />
            </a-tooltip>
          </span>
          <a-input-number placeholder="请输入" v-decorator="['timeout', { initialValue: defaultValue.timeout||0 }]" :min="0" :max="10000000" />
        </a-form-item>
        <a-form-item 
        v-if="form.getFieldValue('type')=='1'"
          :label-col="formItemLayout.labelCol"
          :wrapper-col="formItemLayout.wrapperCol">
          <span slot="label">
            支持跨域
            <a-tooltip title="设置支持跨域仅仅是允许此api支持客户端跨域，但要实现跨域支持请确认服务端请求地址是否支持跨域">
              <a-icon type="question-circle-o" />
            </a-tooltip>
          </span>
          <a-switch v-decorator="['crossOrigin',{
                valuePropName: 'checked',
            initialValue:defaultValue.crossOrigin||true
          }]"/>
        </a-form-item>
        <a-form-item 
        v-if="form.getFieldValue('type')=='1'||form.getFieldValue('type')=='4'"
          :label-col="formItemLayout.labelCol"
          :wrapper-col="formItemLayout.wrapperCol">
          <span slot="label">
            {{form.getFieldValue('type')=='4'?'SQL参数':'请求参数'}}
            <a-tooltip :title="(form.getFieldValue('type')=='4'?'请根据SQL语句中的问号数量按需填写参数，否则将执行失败，请注意参数的顺序。':'请求地址所需要的参数，支持IDM表达式的方式。')+'例如：此处填写(举例url中有abc=123的参数) @[url(\'abc\')+\'---\'+abc]，组件传递了 {abc:4567} ，则这里替换后则为 123---4567'">
              <a-icon type="question-circle-o" />
            </a-tooltip>
          </span>
          <a-input
            style="display:none"
            v-decorator="[
              'paramJson',
              {
                initialValue:defaultValue.paramJson,
              }
            ]"
          />
          <!--propName：paramJson-->
          <draggable
           tag="div" 
           chosen-class="idmcore-datasource-param-ghost"
           force-fallback="true" 
           animation="300" 
           v-model="paramJson" 
           group="param" 
           @start="paramSelectDrag = true"
           @end="paramSelectDrag = false;"
           handle=".handle">
            <transition-group
                        >
              <div class="ds_form_item" v-for="(element,index) in paramJson" :key="index">
                <div class="ds_form_item_handle">
                  <svg-icon icon-class="listdrag-icon" class="handle"/>
                </div>
                <div class="ds_form_item_content">
                  <a-input @change="paramChange()" placeholder="name" v-model="element.name" style="width:130px"/>
                  <div>:</div>
                  <div style="width:300px;flex-shrink: 0;">
                    <a-switch @change="paramChange()" v-model="element.value" v-if="element.valueType=='1'"/>
                    <a-input @change="paramChange()" v-model="element.value" v-else-if="element.valueType=='2'" placeholder="请输入表达式（示例：@[data.value]）"  style="width:100%"/>
                    <a-input @change="paramChange()" v-model="element.value" v-else placeholder="请输入字符串" style="width:100%"/>
                  </div>
                  <a-select @change="paramChange()" style="width:100px" allowClear dropdownClassName="idm_dev_theme" v-model="element.valueType" :default-value="0">
                    <a-select-option :value="0">字符串</a-select-option>
                    <a-select-option :value="1">布尔</a-select-option>
                    <a-select-option :value="2">表达式</a-select-option>
                  </a-select>
                  <div @click="deleteListRow('paramJson',index)">
                    <svg-icon icon-class="delete-icon"/>
                  </div>
                </div>
              </div>
            </transition-group>
          </draggable>
          <div>
            <a-button icon="plus" @click="pushNewRow('paramJson')">添加</a-button>
          </div>


        </a-form-item>
        <a-form-item
        v-if="form.getFieldValue('type')=='1'"
          :label-col="formItemLayout.labelCol"
          :wrapper-col="formItemLayout.wrapperCol">
          <span slot="label">
            请求头信息
            <a-tooltip title="如果参数值为IDM表达式则支持动态获取非固定值。例如：此处填写(举例url中有abc=123的参数) @[url('abc')+'---'+abc]，组件传递了 {abc:4567} ，则这里替换后则为 123---4567">
              <a-icon type="question-circle-o" />
            </a-tooltip>
          </span>
          <a-input
            style="display:none"
            v-decorator="[
              'headerJson',
              {
                initialValue:defaultValue.headerJson,
              }
            ]"
          />
          <!--propName：headerJson-->
          <draggable
           tag="div" 
           chosen-class="idmcore-datasource-param-ghost"
           force-fallback="true" 
           animation="300" 
           v-model="headerJson" 
           group="header" 
           @start="paramSelectDrag = true"
           @end="paramSelectDrag = false;"
           handle=".handle">
            <transition-group>
              <div class="ds_form_item" v-for="(element,index) in headerJson" :key="index">
                <div class="ds_form_item_handle">
                  <svg-icon icon-class="listdrag-icon" class="handle"/>
                </div>
                <div class="ds_form_item_content">
                  <a-input placeholder="name" v-model="element.name" style="width:130px"/>
                  <div>:</div>
                  <div style="width:300px;flex-shrink: 0;">
                    <a-switch v-model="element.value"  v-if="element.valueType=='1'"/>
                    <a-input v-model="element.value"  v-else-if="element.valueType=='2'" placeholder="请输入表达式（示例：@[data.value]）"  style="width:100%"/>
                    <a-input v-model="element.value"  v-else placeholder="请输入字符串" style="width:100%"/>
                  </div>
                  <a-select style="width:100px" allowClear dropdownClassName="idm_dev_theme" v-model="element.valueType" :default-value="0">
                    <a-select-option :value="0">字符串</a-select-option>
                    <a-select-option :value="1">布尔</a-select-option>
                    <a-select-option :value="2">表达式</a-select-option>
                  </a-select>
                  <div @click="deleteListRow('headerJson',index)">
                    <svg-icon icon-class="delete-icon"/>
                  </div>
                </div>
              </div>
            </transition-group>
          </draggable>
          <div>
            <a-button icon="plus" @click="pushNewRow('headerJson')">添加</a-button>
          </div>

        </a-form-item>
        <a-form-item label='响应数据'
        v-show="form.getFieldValue('type')=='2'"
          :label-col="formItemLayout.labelCol"
          :wrapper-col="formItemLayout.wrapperCol">

          <a-input
            style="display:none"
            v-decorator="[
              'resultJson',
              {
                initialValue:defaultValue.resultJson,
              }
            ]"
          />
          <!--propName：resultJson-->
          <div class="monacoeditor-box" v-if="form.getFieldValue('type')=='2'" style="height:200px;">
            <MonacoEditor
                    ref="resultJson"
                    :language="`json`"
                    @mounted="jsonEditorLoaded"
                    @codeChange="transformAllContentToForm('resultJson')"
                  ></MonacoEditor>
          </div>
        </a-form-item>
        <a-form-item
          :label-col="formItemLayout.labelCol"
          :wrapper-col="formItemLayout.wrapperCol"
        v-if="form.getFieldValue('type')=='4'">
          <span slot="label">
            驱动名称
            <a-tooltip title="设置要使用的数据库链接驱动名称，如果为空则使用默认的">
              <a-icon type="question-circle-o" />
            </a-tooltip>
          </span>
          <a-input
            placeholder="请输入"
            v-decorator="[
              'dbName',
              {
                initialValue:defaultValue.dbName,
              }
            ]"
          />
        </a-form-item>
        <a-form-item
          :label-col="formItemLayout.labelCol"
          :wrapper-col="formItemLayout.wrapperCol"
        v-show="form.getFieldValue('type')=='4'">
          <span slot="label">
            SQL语句
            <a-tooltip title="sql语句支持表达式和参数的方式，一般情况不建议在此处使用表达式进行替换，建议使用参数的方式">
              <a-icon type="question-circle-o" />
            </a-tooltip>
          </span>
        <a-input
          style="display:none"
            v-decorator="[
              'dbSql',
              {
                initialValue:defaultValue.dbSql,
              }
            ]"
          />
          <!--propName：dbSql-->
          <div class="monacoeditor-box" v-if="form.getFieldValue('type')=='4'" style="height:200px;">
            <MonacoEditor
                        ref="resultSql"
                        :language="`sql`"
                        @mounted="sqlEditorLoaded"
                        @codeChange="transformAllContentToForm('resultSql')"
                      ></MonacoEditor>
                      </div>
        </a-form-item>

        <a-form-item
          :label-col="formItemLayout.labelCol"
          :wrapper-col="formItemLayout.wrapperCol"
        v-show="form.getFieldValue('type')=='6'">
          <span slot="label">
            数据模型
            <a-tooltip title="可直接选择数据模型中缓存下拉的数据作为数据使用，无需传任何参数。">
              <a-icon type="question-circle-o" />
            </a-tooltip>
          </span>
        <a-input
          style="display:none"
            v-decorator="[
              'datamodelId',
              {
                initialValue:defaultValue.datamodelId,
              }
            ]"
          />
        <a-input
          style="display:none"
            v-decorator="[
              'datamodelName',
              {
                initialValue:defaultValue.datamodelName,
              }
            ]"
          />
          <!--propName：datamodelId-->
          <div class="idm-datamodel-selbox">
            <a-tag v-if="form.getFieldValue('datamodelName')">
              {{form.getFieldValue('datamodelName')}}
            </a-tag>
            <a-tag @click="addModelClick" style="borderStyle: dashed;">
              <a-icon type="plus" /> {{form.getFieldValue('datamodelName')?"重新":""}}选择
            </a-tag>
          </div>
        </a-form-item>
        <a-form-item  :label="form.getFieldValue('type')=='3'?'JSON文件':'CSV文件'"
          v-if="form.getFieldValue('type')=='3'||form.getFieldValue('type')=='5'"
          :label-col="formItemLayout.labelCol"
          :wrapper-col="formItemLayout.wrapperCol">
          <a-upload
            list-type="text"
            :accept="form.getFieldValue('type')=='3'?'.json':'.csv'"
            @preview="handlePreview"
            :customRequest="(file)=>uploadFileHandle(file,'file_name')"
            @change="(file)=>uploadFileChange(file,'file_name')"
            v-decorator="[
              'file_name',
              {
                initialValue:defaultValue.file_name,
                valuePropName: 'fileList',
                rules: [],
              },
            ]"
          >
          <a-button> <a-icon type="upload" /> 点击上传 </a-button>
          </a-upload>
        </a-form-item>

        <a-form-item label='数据处理函数'
          :label-col="formItemLayout.labelCol"
          :wrapper-col="formItemLayout.wrapperCol">
          <!--propName：functionParam-->
          <a-input
              style="display:none"
              v-decorator="[
                'functionParam',
                {
                  initialValue:defaultValue.functionParam,
                }
              ]"
            />
          <div class="monacoeditor-box-title" v-if="form.getFieldValue('type')=='1'||form.getFieldValue('type')=='4'">请求前对参数的处理函数
            <a-tooltip title="处理函数如果执行失败将起不到任何效果">
              <a-icon type="question-circle-o" />
            </a-tooltip><a @click="customFunctionVisible.one=!customFunctionVisible.one" style="margin-left:20px">{{customFunctionVisible.one?'折叠':'展开'}}</a></div>
          <div class="monacoeditor-box"
            v-if="(form.getFieldValue('type')=='1'||form.getFieldValue('type')=='4')&&customFunctionVisible.one" style="height:200px;">
            <MonacoEditor
                        ref="resultJavascriptParam"
                        :language="`javascript`"
                        @mounted="javascriptParamEditorLoaded"
                        @codeChange="transformAllContentToForm('resultJavascriptParam')"
                      ></MonacoEditor>
                      </div>
          <!--propName：functionResult-->
          <a-input
              style="display:none"
              v-decorator="[
                'functionResult',
                {
                  initialValue:defaultValue.functionResult,
                }
              ]"
            />
          <div class="monacoeditor-box-title">{{form.getFieldValue('type')=='1'||form.getFieldValue('type')=='4'||form.getFieldValue('type')=='6'?"请求成功对结果的处理函数":"结果处理函数"}}
            <a-tooltip title="处理函数如果执行失败将起不到任何效果">
              <a-icon type="question-circle-o" />
            </a-tooltip><a @click="customFunctionVisible.two=!customFunctionVisible.two" style="margin-left:20px">{{customFunctionVisible.two?'折叠':'展开'}}</a></div>
          <div class="monacoeditor-box" v-if="customFunctionVisible.two" style="height:200px;">
            <MonacoEditor
                        ref="resultJavascriptResult"
                        :language="`javascript`"
                        @mounted="javascriptResultEditorLoaded"
                        @codeChange="transformAllContentToForm('resultJavascriptResult')"
                      ></MonacoEditor>
                      </div>
          <!--propName：functionError-->
          <a-input
              style="display:none"
              v-decorator="[
                'functionError',
                {
                  initialValue:defaultValue.functionError,
                }
              ]"
            />
          <a-input
              style="display:none"
              v-decorator="[
                'debugResult',
                {
                  initialValue:defaultValue.debugResult,
                }
              ]"
            />
          <div class="monacoeditor-box-title" v-if="form.getFieldValue('type')=='1'||form.getFieldValue('type')=='4'||form.getFieldValue('type')=='6'">请求失败对异常的处理函数
            <a-tooltip title="处理函数如果执行失败将起不到任何效果">
              <a-icon type="question-circle-o" />
            </a-tooltip><a @click="customFunctionVisible.three=!customFunctionVisible.three" style="margin-left:20px">{{customFunctionVisible.three?'折叠':'展开'}}</a></div>
          <div class="monacoeditor-box"
          v-if="(form.getFieldValue('type')=='1'||form.getFieldValue('type')=='4'||form.getFieldValue('type')=='6')&&customFunctionVisible.three" style="height:200px;">
            <MonacoEditor
                        ref="resultJavascriptError"
                        :language="`javascript`"
                        @mounted="javascriptErrorEditorLoaded"
                        @codeChange="transformAllContentToForm('resultJavascriptError')"
                      ></MonacoEditor>
                      </div>
        </a-form-item>

      </a-form>
      </div>
      <a-modal 
      wrapClassName="idm_datasource_preview_modal" 
      :bodyStyle="{'padding':0}"
      :centered="true"
      width="800px"
      v-model="moduleIntelfaceVisible" :footer="null" title="接口描述">
        <a-tabs :default-active-key="0">
          <a-tab-pane  v-for="(item,index) in form.getFieldValue('moduleArray')" :key="index" :tab="item.label" force-render>
            <div style="height:500px;overflow: auto;padding:20px" class="scrollbar_style">
              <div v-if="getIntelfaceInfo(item.key)"
                  v-html="getIntelfaceInfo(item.key)"></div>
                  <a-empty description="暂无接口描述" v-else/>
            </div>
          </a-tab-pane>
        </a-tabs>
      </a-modal>
      <a-modal 
        wrapClassName="idm_datasource_preview_modal" 
        :centered="true"
        width="1000px"
        v-model="intelfaceDebugVisible" title="数据源调试"
        okText='测试'
        cancelText='关闭'
        destroyOnClose
        @ok="debugDataSourceTest">
        
        <div slot="footer" style="display:flex;justify-content: space-between;">
          <div style="color:red;line-height: 32px;">
            温馨提示：数据源保存会记录最后一次调试结果以作用于组件能快速选择要展示的结果属性。
          </div>
          <div>
              <a-button key="back" @click="intelfaceDebugVisible=false">
                关闭
              </a-button>
              <a-button key="submit" :loading="testLoading" type="primary" @click="debugDataSourceTest">
                测试
              </a-button>
          </div>
        </div>
        <div class="idmcore-datasource-debugbox">
          <div v-if="form.getFieldValue('type')=='1'||form.getFieldValue('type')=='4'" style="height:60vh;width: 50%;overflow: auto;" class="scrollbar_style">
            <div class="idd-title">请求参数
              <a-tooltip title="请求参数中的值类型如果为表达式则需要自行替换实际接口需要的值文本，调试过程中不会对参数进行表达式转换">
              <a-icon type="question-circle-o" />
            </a-tooltip>：</div>
            <div>
              <div class="ds_form_item" v-for="(element,index) in paramJson_debug" :key="index">
                <div class="ds_form_item_handle">
                  {{index+1}}
                </div>
                <div class="ds_form_item_content">
                  <a-input disabled placeholder="name" v-model="element.name" style="width:130px"/>
                  <div>:</div>
                  <div style="width:260px;flex-shrink: 0;">
                    <a-switch v-model="element.value" v-if="element.valueType=='1'"/>
                    <a-input v-model="element.value" v-else-if="element.valueType=='2'" placeholder="请输入参数值"  style="width:100%"/>
                    <a-input v-model="element.value" v-else placeholder="请输入参数值" style="width:100%"/>
                  </div>
                </div>
              </div>
            </div>
            <div style="text-align:center"  v-if="!paramJson_debug.length">
              <a-empty description="暂无请求参数"/>
            </div>
            <div v-if="form.getFieldValue('type')=='1'" class="idd-title" style="padding-top:10px">请求头信息
              <a-tooltip title="请求头信息中的值类型如果为表达式则需要自行替换实际接口需要的值文本，调试过程中不会对请求头信息进行表达式转换">
              <a-icon type="question-circle-o" />
            </a-tooltip>：</div>
            <div v-if="form.getFieldValue('type')=='1'" >
              <div class="ds_form_item" v-for="(element,index) in headerJson_debug" :key="index">
                <div class="ds_form_item_handle">
                  {{index+1}}
                </div>
                <div class="ds_form_item_content">
                  <a-input disabled placeholder="name" v-model="element.name" style="width:130px"/>
                  <div>:</div>
                  <div style="width:260px;flex-shrink: 0;">
                    <a-switch v-model="element.value" v-if="element.valueType=='1'"/>
                    <a-input v-model="element.value" v-else-if="element.valueType=='2'" placeholder="请输入参数值"  style="width:100%"/>
                    <a-input v-model="element.value" v-else placeholder="请输入参数值" style="width:100%"/>
                  </div>
                </div>
              </div>
              <div style="text-align:center"  v-if="!headerJson_debug.length">
                <a-empty description="暂无请求头信息"/>
              </div>
            </div>
          </div>
          <!-- <div v-else style="line-height:60vh; text-align:center">
            非 接口Api、sql语句 类型，请直接点击测试
          </div> -->
          <div :style="form.getFieldValue('type')=='1'||form.getFieldValue('type')=='4'?'width: 49%;':'width: 100%;'">
            <div class="idd-title">调试结果
              <a-tooltip title="调试结果并非数据源直接返回的结果，此处显示的结果是经过了数据处理函数格式化后显示的结果">
              <a-icon type="question-circle-o" />
            </a-tooltip>：</div>
            <div class="monacoeditor-box"
            style="height:calc(60vh - 34px);">
            <MonacoEditor
                        ref="resultJSONDebug"
                        :language="`json`"
                        @mounted="javascriptDebugEditorLoaded"
                      ></MonacoEditor>
                      </div>
          </div>
        </div>
      </a-modal>
      <a-modal  
      wrapClassName="idm_dm_data_source_select"
        :centered="true"
        :bodyStyle="{ 'padding': 0 }"
        width="700px"
        v-model="dataModelSelectVisible" title="数据模型选择"
        :footer="null"
        destroyOnClose>
            <!--检索条件-->
            <div class="idm-page-select-search">
              <a-select default-value="" v-model="conditionValue.TYPE" style="width: 100px" allowClear dropdownClassName="idm_dev_theme" @change="handleChange">
                <a-select-option v-for="(item,index) in DataModelConditionType" :key="index" :value="item.value">
                  {{item.text}}
                </a-select-option>
              </a-select>
              <a-select default-value="" v-model="conditionValue.GROUP_ID" style="width: 150px" allowClear dropdownClassName="idm_dev_theme" @change="handleChange">
                <a-select-option v-for="(item,index) in DataModelConditionGroup" :key="index" :value="item.value">
                  {{item.text}}
                </a-select-option>
              </a-select>
              <a-input-search placeholder="请输入关键词" v-model="conditionValue.searchText" style="width: 200px" @search="handleChange" />
            </div>
            <!--内容-->
            <div class="idm-page-select-content scrollbar_style" @scroll="scrollHandle">
              <div class="idm-page-select-content-item" @click="selectDataModel(item)" v-for="(item,index) in resultList" :key="index" >
                <div class="idm-psc-item-inner" :class="{'active':hasCheck(item)}">
                  <div>
                    <div class="idm-psc-item-inner-title">
                      <label>{{item.title}}</label>
                      <a-tag :color="tagColorArray[item.type]">
                        {{ DataModelConditionType.filter((sitem) => sitem.value == item.type).length?DataModelConditionType.filter((sitem) => sitem.value == item.type)[0].text:"" }}
                      </a-tag>
                      <a-tag color="blue">
                        {{ DataModelConditionGroup.filter((sitem) => sitem.value == item.groupId).length?DataModelConditionGroup.filter((sitem) => sitem.value == item.groupId)[0].text:"" }}
                      </a-tag>
                      <a-tag>
                        {{item.shareType=="0"?"私有":"共享"}}
                      </a-tag>
                    </div>
                    <div class="idm-psc-item-inner-desc" style="height:auto;max-height:46px">
                      {{item.remark}}
                    </div>
                  </div>
                  <svg-icon icon-class="rb-select-icon" class="rb-select-icon"/>
                </div>
              </div>
              <div class="idm-page-select-content-loading" style="text-align: center;padding:20px 0px;">
                <a-spin v-if="loading"></a-spin>
                {{loadEnd?resultList.length==0?"暂无数据":"没有更多了":""}}
              </div>
            </div>
      </a-modal>
    </a-modal>
</template>

<script>
//导入代码编辑器
import MonacoEditor from "@/plugins/vscode/monacoEditor.vue";
export default {
  name: 'DataSourceForm',
  components: {
    MonacoEditor
  },
  data(){
      return {
        paramEdit:false,
        moduleIntelfaceVisible:false,
        intelfaceDebugVisible:false,
        dataModelSelectVisible:false,
        tagsList:["{}","[]","[{}]"],
        paramJson:[],
        headerJson:[],
        refreshJson:[],
        paramSelectDrag:false,
        customFunctionVisible:{
          one:false,
          two:false,
          three:false,
        },
        paramJson_debug:[],
        headerJson_debug:[],
        testLoading:false,

        tagColorArray:["","#108ee9","#fdc500","#2dd300","#4250ff"],
        DataModelConditionType: IDM.setting.develop.dataModelConditionType instanceof Array
            ? [{ text: "全部", value: "" }].concat(
                IDM.setting.develop.dataModelConditionType
              )
            : [],
        DataModelConditionGroup:IDM.setting.develop.dataModelConditionGroup instanceof Array
            ? [{ text: "全部", value: "" }].concat(
                IDM.setting.develop.dataModelConditionGroup
              )
            : [],
        resultList: [],
        totalCount:0,
        conditionValue:{
          pageIndex:1,
          pageSize:10,
          TYPE:"",
          GROUP_ID:"",
          searchText:""
        },
        loading:false,
        loadEnd:false,
      }
  },
  props: {
    visible:{
        type:Boolean,
        default:false
    },
    defaultValue:{
      type:Object
    },
    ConditionGroup:{
      type:Array,
      default:()=>{return []}
    },
    ConditionType:{
      type:Array,
      default:()=>{return []}
    },
    ConditionModuleList:{
      type:Array,
      default:()=>{return []}
    },
    ConditionProductList:{
      type:Array,
      default:()=>{return []}
    }
  },
  beforeCreate() {
    this.form = this.$form.createForm(this, { name: 'form_in_modal_ds' });
    if(!this.form.getFieldValue("type")){
      this.form.setFieldsValue({"type":"1"})
    }
    if(!this.form.getFieldValue("shareType")){
      this.form.setFieldsValue({"shareType":"1"})
    }
    if(!this.form.getFieldValue("loadType")){
      this.form.setFieldsValue({"loadType":"0"})
    }
    if(!this.form.getFieldValue("remark")){
      this.form.setFieldsValue({"remark":""})
    }
    if(!this.form.getFieldValue("groupId")){
      this.form.setFieldsValue({"groupId":""})
    }
    if(!this.form.getFieldValue("datamodelId")){
      this.form.setFieldsValue({"datamodelId":""})
    }
    if(!this.form.getFieldValue("title")){
      this.form.setFieldsValue({"title":""})
    }
    if(!this.form.getFieldValue("author")){
      this.form.setFieldsValue({"author":""})
    }
    if(!this.form.getFieldValue("moduleArray")){
      this.form.setFieldsValue({"moduleArray":[]})
    }
    if(!this.form.getFieldValue("productArray")){
      this.form.setFieldsValue({"productArray":[]})
    }
    if(!this.form.getFieldValue("tags")){
      this.form.setFieldsValue({"tags":[]})
    }
    if(!this.form.getFieldValue("api")){
      this.form.setFieldsValue({"api":""})
    }
    if(!this.form.getFieldValue("requestType")){
      this.form.setFieldsValue({"requestType":"GET"})
    }
    if(!this.form.getFieldValue("timeout")){
      this.form.setFieldsValue({"timeout":0})
    }
    if(!this.form.getFieldValue("itemIndex")){
      this.form.setFieldsValue({"itemIndex":1})
    }
    if(!this.form.getFieldValue("crossOrigin")||this.form.getFieldValue("crossOrigin")===false){
      this.form.setFieldsValue({"crossOrigin":false})
    }
    if(!this.form.getFieldValue("resultJson")){
      this.form.setFieldsValue({"resultJson":"{}"})
    }
    if(!this.form.getFieldValue("dbName")){
      this.form.setFieldsValue({"dbName":""})
    }
    if(!this.form.getFieldValue("dbSql")){
      this.form.setFieldsValue({"dbSql":"SELECT"})
    }
    if(!this.form.getFieldValue("file_name")){
      this.form.setFieldsValue({"file_name":""})
    }
    if(!this.form.getFieldValue("functionParam")){
      this.form.setFieldsValue({"functionParam":"function (options){\n\treturn options;\n}"})
    }
    if(!this.form.getFieldValue("functionResult")){
      this.form.setFieldsValue({"functionResult":"function (res){\n\treturn res.data;\n}"})
    }
    if(!this.form.getFieldValue("functionError")){
      this.form.setFieldsValue({"functionError":"function (err){\n\n}"})
    }
  },
  created() {

    let that = this;
    //数据源分组
    if (
      !IDM.develop.cacheData.DataModelConditionGroupList &&
      IDM.type(IDM.setting.develop.dataModelConditionGroup) == "string"
    ) {
      IDM.http.get(IDM.setting.develop.dataModelConditionGroup).then((res) => {
        let resultData = [{ text: "全部", value: "" }];
        if (res.data.code == 200) {
          resultData = resultData.concat(res.data.data);
        }
        IDM.develop.cacheData.DataModelConditionGroupList = resultData;
        that.DataModelConditionGroup = resultData;
      });
    } else if (
      IDM.type(IDM.setting.develop.dataModelConditionGroup) == "string"
    ) {
      this.DataModelConditionGroup = IDM.develop.cacheData.DataModelConditionGroupList;
    }
    //类型分组
    if (
      !IDM.develop.cacheData.DataModelConditionTypeList &&
      IDM.type(IDM.setting.develop.dataModelConditionType) == "string"
    ) {
      IDM.http.get(IDM.setting.develop.dataModelConditionType).then((res) => {
        let resultData = [{ text: "全部", value: "" }];
        if (res.data.code == 200) {
          resultData = resultData.concat(res.data.data);
        }
        IDM.develop.cacheData.DataModelConditionTypeList = resultData;
        that.DataModelConditionType = resultData;
      });
    } else if (
      IDM.type(IDM.setting.develop.dataModelConditionType) == "string"
    ) {
      this.DataModelConditionType = IDM.develop.cacheData.DataModelConditionTypeList;
    }
  },
  activated() {
  },
  mounted() {
  },
  computed: {
    formItemLayout() {
      const { formLayout } = this;
      return {
            labelCol: { span: 4 },
            wrapperCol: { span: 20 },
          };
    },
  },
  destroyed() {},
  methods:{
    scrollHandle(e){
      // console.log("gundong",e.target);
      if(e.target.scrollHeight-e.target.scrollTop-e.target.clientHeight<=100){
        if(!this.loading&&!this.loadEnd){
          this.conditionValue.pageIndex=this.conditionValue.pageIndex+1;
          this.loadData();
        }
      }
    },
    addModelClick(){
      if(this.conditionValue.pageIndex==1){
        this.handleChange();
      }
      this.dataModelSelectVisible = true;
    },
    //检索条件改变时候触发
    handleChange(){
      this.conditionValue.pageIndex = 1;
      this.loadEnd = false;
      this.loadData(true);
    },

    loadData(isreload){
      let that = this;
      if((!IDM.setting.api.dataModelFetchListApi&&!IDM.setting.mockurl.dataModelFetchListApi)||that.loading){
        return
      }
      if(isreload){
        that.resultList=[];
      }
      that.loading = true;
      let param = {
        pageIndex:this.conditionValue.pageIndex,
        pageSize:this.conditionValue.pageSize,
        searchText:this.conditionValue.searchText
      };
      if(this.conditionValue.TYPE){
        param["TYPE"] = this.conditionValue.TYPE
      }
      if(this.conditionValue.GROUP_ID){
        param["GROUP_ID"] = this.conditionValue.GROUP_ID
      }
      IDM.http.get(IDM.setting.api.dataModelFetchListApi||IDM.setting.mockurl.dataModelFetchListApi,param).then(res=>{
        if(res&&res.data&&res.data.code=="200"&&res.data.data&&res.data.data.rows){
          if(res.data.data.rows.length<that.conditionValue.pageSize){
            that.loadEnd = true;
          }
          that.resultList = that.resultList.concat(res.data.data.rows);
          that.totalCount = res.data.data.total;
        }
        that.loading = false;
      }).catch(err=>{
        IDM.message.error(err.message)
        that.loading = false;
      })
    },
    hasCheck(pitem){
      let hasExists = false;
      let thisValue = this.form.getFieldValue("datamodelId");
      if(!thisValue){
        return hasExists;
      }
      if(!(thisValue instanceof Array)){
        thisValue = [thisValue];
      }
      if (
          thisValue==pitem.id
        ) {
          hasExists = true;
        }
      return hasExists;
    },
    selectDataModel(item){
      this.form.setFieldsValue({datamodelId:item.id,datamodelName:item.title});
      this.dataModelSelectVisible = false;
    },

    debugDataSourceTest(){
      let that = this;
      var dataSourceObject = this.form.getFieldsValue();
      dataSourceObject.paramJson_debug = this.paramJson_debug;
      dataSourceObject.headerJson_debug = this.headerJson_debug;
      if(this.defaultValue.isEditInfo){
        dataSourceObject.dataSourceId = this.defaultValue.id;
      }
      this.testLoading = true;
      let backStatus = IDM.datasource.debug(dataSourceObject,function(resData){
        //成功结果
        that.testLoading = false;
        that.$refs.resultJSONDebug && that.$refs.resultJSONDebug.setContent(JSON.stringify(resData));
        that.changeSetFormValue("debugResult",JSON.stringify(resData),0);
        IDM.message.success("测试成功！关闭后再次保存数据源此次调试结果才会被保存。")
      },function(error){
        IDM.message.error("测试失败！"+error.message);
        that.testLoading = false;
      })
      if(backStatus===false){
        that.testLoading = false;
      }
    },
    javascriptDebugEditorLoaded() {
      
    },
    debugDataSource(){
      this.testLoading = false;
      this.intelfaceDebugVisible = true;
      this.paramJson_debug = _.cloneDeep(this.paramJson);
      this.headerJson_debug = _.cloneDeep(this.headerJson);
      if(this.form.getFieldValue("type")!="1"&&this.form.getFieldValue("type")!="4"){
        this.$nextTick(function(){
          this.debugDataSourceTest();
        })
      }
    },
    typeChange(){
      this.customFunctionVisible.one = false;
      this.customFunctionVisible.two = false;
      this.customFunctionVisible.three = false;
    },
    paramChange(){
      this.paramEdit = true;
    },
    moduleChange(value, option){
      let lastValue = value&&value.length?value[value.length-1]:null;
      //判断是否修改过了
      if(lastValue&&!this.defaultValue.isEditInfo&&!this.paramEdit){
        //存在则去取出接口参数
        let intelfaceParam = this.getIntelfaceInfo(lastValue.key,"interfaceParamJson");
        if(intelfaceParam){
          let intelfaceParamJSON = [];
          try {
            intelfaceParamJSON = JSON.parse(intelfaceParam);
          } catch (error) {
          }
          this.paramJson = [];
          //[{\"keyName\":\"姓名\",\"keyVal\":\"key\",\"idm_datakey\":\"JHfsjeqstWOLfcCj\",\"desc\":\"备注信息\"},
          //{\"keyName\":\"年龄\",\"keyVal\":\"nl\",\"idm_datakey\":\"P3e8MyXulFVvjUvi\",\"desc\":\"年龄备注\"}]
          intelfaceParamJSON.forEach(item=>{
            this.paramJson.push({name:item.keyName,value:item.keyType==1?item.keyVal=='true'||item.keyVal=='1':item.keyVal,valueType:item.keyType||0})
          });
          this.form.setFieldsValue({paramJson:JSON.stringify(this.paramJson)});
        }
      }
    },
    getIntelfaceInfo(key,getName='interfaceInfo'){
      let resultInfo = "";
      if(this.ConditionModuleList&&this.ConditionModuleList.length&&this.ConditionModuleList[0].groupId){
        this.ConditionModuleList.forEach(item=>{
          item.componentList&&item.componentList.forEach(sitem=>{
            if(sitem.value==key||sitem.comId==key){
              resultInfo = sitem[getName];
            }
          })
        })
      }else{
        let currentList = this.ConditionModuleList.filter(sitem=>sitem.value==key||sitem.comId==key);
        resultInfo = currentList&&currentList.length?currentList[0][getName]:"";
      }
      return resultInfo
    },
    openModuleIntelfaceInfo(){
      this.moduleIntelfaceVisible = true;
      //循环取出所有组件信息
    },
    handlePreview(file){
      if(file.content){
        const elink = document.createElement('a');
          elink.download = file.name;
          elink.style.display = 'none';
          const blob = new Blob([file.content], { type: 'application/'+file.name.split(".")[file.name.split(".").length-1] });
          const href = URL.createObjectURL(blob);
          elink.href = href;
          document.body.appendChild(elink);
          elink.click();
          document.body.removeChild(elink);
          window.URL.revokeObjectURL(href);
      }else{
        window.open(IDM.url.getWebPath(file.src));
      }
    },
    deleteListRow(name,index){
      if(name=="paramJson"){
        this.paramEdit = true;
      }
      this[name].splice(index,1);
      // this.$forceUpdate();
      this.form.setFieldsValue({[name]:JSON.stringify(this[name])});
    },
    pushNewRow(name){
      if(name=="paramJson"){
        this.paramEdit = true;
      }
      if(name=="refreshJson"){
        this[name].push({key:"",desc:""})
      }else{
        this[name].push({name:"",value:"",valueType:0})
      }
      this.form.setFieldsValue({[name]:JSON.stringify(this[name])});
    },
    endSort(){
      this.drag=false;
    },
    //code改变要设置到form中
    transformAllContentToForm(propName){
          // <!--propName：resultJson-->
          // <!--propName：dbSql-->
          // <!--propName：functionError-->
          // <!--propName：functionResult-->
          // <!--propName：functionParam-->
      let resultJson = this.$refs.resultJson && this.$refs.resultJson.getContent();
      let dbSql = this.$refs.resultSql && this.$refs.resultSql.getContent();
      let functionError = this.$refs.resultJavascriptError && this.$refs.resultJavascriptError.getContent();
      let functionResult = this.$refs.resultJavascriptResult && this.$refs.resultJavascriptResult.getContent();
      let functionParam = this.$refs.resultJavascriptParam && this.$refs.resultJavascriptParam.getContent();
      console.log("🚀 ~ file: DataSourceForm.vue ~ line 865 ~ transformAllContentToForm ~ functionParam", functionParam)
      "resultJson"==propName?this.changeSetFormValue("resultJson",resultJson,0):null;
      "resultSql"==propName?this.changeSetFormValue("dbSql",dbSql,0):null;
      "resultJavascriptError"==propName?this.changeSetFormValue("functionError",functionError,0):null;
      "resultJavascriptResult"==propName?this.changeSetFormValue("functionResult",functionResult,0):null;
      "resultJavascriptParam"==propName?this.changeSetFormValue("functionParam",functionParam,0):null;
    },
    /**
     * json格式的静态数据 
     */
    jsonEditorLoaded(reset) {
      let v = this.defaultValue.isEditInfo?(reset===true?this.defaultValue.resultJson:this.form.getFieldValue("resultJson")):this.form.getFieldValue("resultJson");
      console.log("🚀 ~ file: DataSourceForm.vue ~ line 875 ~ jsonEditorLoaded ~ this.form.getFieldValue", this.form.getFieldValue("resultJson"),v,reset)
      
      this.$refs.resultJson && this.$refs.resultJson.setContent(v);
    },
    sqlEditorLoaded(reset) {
      let v = this.defaultValue.isEditInfo?(reset===true?this.defaultValue.dbSql:this.form.getFieldValue("dbSql")):this.form.getFieldValue("dbSql");
      this.$refs.resultSql && this.$refs.resultSql.setContent(v);
    },
    javascriptParamEditorLoaded(reset) {
      let v = this.defaultValue.isEditInfo?(reset===true?this.defaultValue.functionParam:this.form.getFieldValue("functionParam")):this.form.getFieldValue("functionParam");
      this.$refs.resultJavascriptParam && this.$refs.resultJavascriptParam.setContent(v);
    },
    javascriptResultEditorLoaded(reset) {
      let v = this.defaultValue.isEditInfo?(reset===true?this.defaultValue.functionResult:this.form.getFieldValue("functionResult")):this.form.getFieldValue("functionResult");
      this.$refs.resultJavascriptResult && this.$refs.resultJavascriptResult.setContent(v);
    },
    javascriptErrorEditorLoaded(reset) {
      let v = this.defaultValue.isEditInfo?(reset===true?this.defaultValue.functionError:this.form.getFieldValue("functionError")):this.form.getFieldValue("functionError");
      this.$refs.resultJavascriptError && this.$refs.resultJavascriptError.setContent(v);
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
    uploadFileChange({ file,fileList },formKey) {
      let selectList = this.form.getFieldValue(formKey)||[];
      this.fileList = fileList;
      if(file&&file.status=="removed"){
        selectList&&selectList.forEach((fitem,index)=>{
          const isExists = fileList.filter(item=>item.uid==fitem.uid);
          if(!isExists||(isExists&&isExists.length==0)){
            selectList.splice(index, 1)
          }
        })
        this.changeSetFormValue(formKey,selectList);
      }

    },
    /**
     * 上传附件处理函数
     */
    uploadFileHandle(file,formKey){
      console.log("🚀 ~ file: IControlSettingPanel.vue ~ line 736 ~ uploadFileHandle ~ file", file)
      let that = this;
      let newObject = {
        uid: new Date().getTime()+IDM.uuid(),
        name: file.file.name,
        status: 'uploading',
        // url: IDM.url.getWebPath(resultData.filePath),
      }
      let selectedList = _.cloneDeep(this.form.getFieldValue(formKey))||[];
      if(selectedList instanceof Array){
        selectedList.push(newObject);
      }
      that.changeSetFormValue(formKey,selectedList);
      let customParam = {...IDM.setting.webRoot,getFileContent:1};
      IDM.http.upload(IDM.setting.api.uploadFileServerUrl,file.file,customParam).then(res=>{
        let resultData=res.data.data;
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
        // this.visible = !this.visible;
        // this.spinning = !this.spinning;
        that.changeSetFormValue(formKey,selectedList);

        // this.idm_$message.success(`${file.file.name} 上传成功.`);
      }).catch(err=>{
        // this.idm_$message.error(`${file.file.name} 上传失败.`);
        newObject.status = "error";
      });
    },
    changeSetFormValue(formKey,selectedList,delay=10){
      var setParam = {};
      setParam[formKey] = _.cloneDeep(selectedList);
      let that = this;
      //延迟设置，不然点击内部的删除无法实现重新设置
      setTimeout(() => {
        that.form.setFieldsValue(setParam);
      }, delay);
    },
    getStyle(key,object){
        let styles = {};
        switch (key) {
            case "root":
            break;
            default:
            break;
        }
        return styles;
    }
  },
  watch:{
    defaultValue:{
      handler(){
        //type   title   shareType   author   remark   groupId   tags    loadType   api   requestType   crossOrigin   resultJson   dbName   dbSql   file_name   functionParam   functionResult   functionError
        this.form.setFieldsValue({
          "type":this.defaultValue.type||"1",
          "title":this.defaultValue.title||"",
          "author":this.defaultValue.author||"",
          "remark":this.defaultValue.remark||"",
          "groupId":this.defaultValue.groupId||"",
          "datamodelId":this.defaultValue.datamodelId||"",
          "datamodelName":this.defaultValue.datamodelName||"",
          "shareType":this.defaultValue.shareType||"1",
          "loadType":this.defaultValue.loadType||"0",
          "moduleArray":this.defaultValue.moduleArray||[],
          "productArray":this.defaultValue.productArray||[],
          "tags":this.defaultValue.tags||[],
          "api":this.defaultValue.api||"",
          "requestType":this.defaultValue.requestType||"GET",
          "timeout":this.defaultValue.timeout||0,
          "itemIndex":this.defaultValue.itemIndex||1,
          "crossOrigin":this.defaultValue.crossOrigin===true,
          "resultJson":this.defaultValue.resultJson||"{}",
          "dbName":this.defaultValue.dbName||"",
          "dbSql":this.defaultValue.dbSql||"SELECT ",
          "file_name":this.defaultValue.file_name||"",
          "functionParam":this.defaultValue.functionParam||"function (options){\n\treturn options;\n}",
          "functionResult":this.defaultValue.functionResult||"function (res){\n\treturn res.data;\n}",
          "functionError":this.defaultValue.functionError||"function (err){\n\n}",
          "debugResult":this.defaultValue.debugResult||""
          })
          
        this.jsonEditorLoaded(true);
        this.sqlEditorLoaded(true);
        this.javascriptParamEditorLoaded(true);
        this.javascriptResultEditorLoaded(true);
        this.javascriptErrorEditorLoaded(true);
        this.paramJson = this.defaultValue.paramJson? JSON.parse(this.defaultValue.paramJson):[];
        this.headerJson = this.defaultValue.headerJson?JSON.parse(this.defaultValue.headerJson):[];
        this.refreshJson = this.defaultValue.refreshJson?JSON.parse(this.defaultValue.refreshJson):[];
      },
      deep: true,
    },
    paramJson:{
      handler(){
        this.form.setFieldsValue({
          "paramJson":JSON.stringify(this.paramJson),
          })
      },
      deep: true,
    },
    headerJson:{
      handler(){
        this.form.setFieldsValue({
          "headerJson":JSON.stringify(this.headerJson),
          })
      },
      deep: true,
    },
    refreshJson:{
      handler(){
        this.form.setFieldsValue({
          "refreshJson":JSON.stringify(this.refreshJson),
          })
      },
      deep: true,
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
.idm_datasource_preview_modal{
    .idm-ant-tag{
        margin-bottom: 5px;
        background: transparent;
    }
    .monacoeditor-box{
        box-sizing: content-box;
        border-width: 1px;
        border-style: solid;
        border-color: #d9d9d9;
    }
    .ds_form_item{
        display: flex;
        align-items: center;
        .ds_form_item_handle{
            padding: 0px 10px 0 0;
        }
        .ds_form_item_content{
            display: flex;
            align-items: center;
            &>*{
                margin-right: 10px;
                &:last-child{
                    cursor: pointer;
                    opacity: 0.8;
                    &:hover{
                        opacity: 1;
                    }
                }
            }
        }
        .handle{
            cursor: ns-resize;
        }
    }
    .idmcore-datasource-param-ghost {
        opacity: 0.5;
        background: #d9d9d9 !important;
    }
    .idmcore-datasource-debugbox{
        display: flex;
        justify-content: space-between;
        height: 60vh;
        .idd-title{
            font-weight: bold;
            // font-size: 16px;
            margin-bottom: 10px;
        }
        .ds_form_item{
            margin-bottom: 10px;
        }
    }
}
</style>

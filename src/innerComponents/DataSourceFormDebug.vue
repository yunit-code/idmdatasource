<template>
  <a-modal 
    wrapClassName="idm_datasource_preview_modal" 
    :centered="true"
    width="1000px"
    :visible="visible" title="数据源调试"
    okText='测试'
    cancelText='关闭'
    @cancel="() => { $emit('cancel') }"
    destroyOnClose>
    
    <div slot="footer" style="display:flex;justify-content: space-between;">
      <div style="color:red;line-height: 32px;">
        温馨提示：数据源会自动记录最后一次调试结果以作用于组件能快速选择要展示的结果属性。
      </div>
      <div>
          <a-button key="back" @click="() => { $emit('cancel') }">
            关闭
          </a-button>
          <a-button key="submit" :loading="testLoading" type="primary" @click="debugDataSourceTest">
            测试
          </a-button>
      </div>
    </div>
    <div class="idmcore-datasource-debugbox">
      <div v-if="defaultValue.type=='1'||defaultValue.type=='4'" style="height:60vh;width: 50%;overflow: auto;" class="scrollbar_style">
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
        <div v-if="defaultValue.type=='1'" class="idd-title" style="padding-top:10px">请求头信息
          <a-tooltip title="请求头信息中的值类型如果为表达式则需要自行替换实际接口需要的值文本，调试过程中不会对请求头信息进行表达式转换">
          <a-icon type="question-circle-o" />
        </a-tooltip>：</div>
        <div v-if="defaultValue.type=='1'" >
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
      <div :style="defaultValue.type=='1'||defaultValue.type=='4'?'width: 49%;':'width: 100%;'">
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
</template>

<script>
//导入代码编辑器
import MonacoEditor from "@/plugins/vscode/monacoEditor.vue";
export default {
  name: 'DataSourceFormDebug',
  components: {
    MonacoEditor
  },
  data(){
      return {
        paramJson:[],
        headerJson:[],
        paramJson_debug:[],
        headerJson_debug:[],
        testLoading:false,
      }
  },
  props: {
    visible:{
        type:Boolean,
        default:false
    },
    defaultValue:{
      type:Object,
      default:()=>{
        return {}
      }
    },
  },
  beforeCreate() {
  },
  created() {
  },
  activated() {
  },
  mounted() {
  },
  computed: {
  },
  destroyed() {},
  methods:{
    debugDataSourceTest(){
      let that = this;
      var dataSourceObject = _.cloneDeep(this.defaultValue);
      dataSourceObject.paramJson_debug = this.paramJson_debug;
      dataSourceObject.headerJson_debug = this.headerJson_debug;
      if(this.defaultValue.isEditInfo){
        dataSourceObject.dataSourceId = this.defaultValue.id;
      }
      this.testLoading = true;
      let backStatus = IDM.datasource.debug(dataSourceObject,function(resData){
        //成功结果
        that.testLoading = false;
        let resDataJson = JSON.stringify(resData);
        that.$refs.resultJSONDebug && that.$refs.resultJSONDebug.setContent(resDataJson);
        //这里直接修改数据库
        that.saveDataSourceData({
          id:dataSourceObject.id,
          editDebugData:"1",
          debugResult:resDataJson
        }).then((res) => {
            if (res.data.code == 200) {
                IDM.message.success("测试成功！此次调试结果已被保存。")
            } else {
                IDM.message.error("测试成功！此次调试结果保存失败！"+res.data.message)
            }
          }).catch(error=>{
            if(error.response.status=="30001"){
              IDM.message.error("测试成功！但保存失败，请重新登录再回来操作！");
            }else{
              IDM.message.error("测试成功！但保存失败！"+error.message);
            }
            // form.resetFields();
            // that.DataSourceFormVisible = false;
        });
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
    /**
     * 保存数据源接口
     * @param {*} params 
     * 
     * @returns 
     */
     saveDataSourceData(params) {
        return IDM.http.post(IDM.setting.api.dataSourceSaveFormApi, params,{
            headers:{
                "Content-Type": "application/json;charset=UTF-8"
              }
          })
    },
    debugDataSource(){
      this.testLoading = false;
      this.paramJson_debug = _.cloneDeep(this.paramJson);
      this.headerJson_debug = _.cloneDeep(this.headerJson);
      if(this.defaultValue.type!="1"&&this.defaultValue.type!="4"){
        this.$nextTick(function(){
          this.debugDataSourceTest();
        })
      }
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
        this.paramJson = this.defaultValue.paramJson? JSON.parse(this.defaultValue.paramJson):[];
        this.headerJson = this.defaultValue.headerJson?JSON.parse(this.defaultValue.headerJson):[];
        this.debugDataSource();
      },
      deep: true,
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
</style>

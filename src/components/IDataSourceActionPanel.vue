<template>
  
  <!--
    根目录规范(必须不能为空)：
    idm-ctrl：控件类型 drag_container：容器，drag_container_inlieblock：行内容器，idm_module：非容器的组件
    id：使用moduleObject.id，如果id不使用这个将会被idm-ctrl-id属性替换
    idm-ctrl-id：组件的id，这个必须不能为空
  -->
  <div idm-ctrl="idm_module"
   class="idm-datasource-module"
   :id="moduleObject.id" 
   :idm-ctrl-id="moduleObject.id">
    <!--
      组件内部容器
      增加class="drag_container" 必选
      idm-ctrl-id：组件的id，这个必须不能为空
      idm-container-index  组件的内部容器索引，不重复唯一且不变，必选
    -->
    <div class="idm-dbd-condition">
      <a-select
        style="width: 100px"
        allowClear
        dropdownClassName="idm_dev_theme"
        placeholder="类型"
        default-value=""
        v-model="condition.TYPE"
        @change="change"
      >
        <a-select-option
          v-for="(item, index) in ConditionType"
          :key="index"
          :value="item.value"
        >
          {{ item.text }}
        </a-select-option>
      </a-select>
      <a-select
        style="width: 150px"
        allowClear
        dropdownClassName="idm_dev_theme"
        placeholder="分组"
        default-value=""
        v-model="condition.GROUP_ID"
        @change="change"
      >
        <a-select-option
          v-for="(item, index) in ConditionGroup"
          :key="index"
          :value="item.value"
        >
          {{ item.text }}
        </a-select-option>
      </a-select>
      <a-select
        style="width: 250px"
        allowClear
        dropdownClassName="idm_dev_theme"
        :mode="'multiple'"  optionFilterProp="children"
        placeholder="适配组件"
        default-value=""
        v-model="condition.moduleList"
        @change="change"
      >
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
            {{ item.text }}
          </a-select-option>
        </template>
      </a-select>
      <a-select
        style="width: 150px"
        allowClear
        dropdownClassName="idm_dev_theme"
        :mode="'multiple'"  optionFilterProp="children"
        placeholder="产品标签"
        default-value=""
        v-model="condition.productList"
        @change="change"
      >
        <a-select-option
          v-for="(item, index) in ConditionProductList"
          :key="index"
          :value="item.value"
        >
          {{ item.text }}
        </a-select-option>
      </a-select>
      <a-input-search
        allowClear
        style="width: 200px"
        placeholder="搜索关键词"
        v-model="condition.searchText"
        @search="change"
      />
      <a-button @click="resetCondition()" style="margin-right: 10px">
        重置搜索
      </a-button>
      <a-button @click="showDataSourceFormModal()" type="primary"> 新建数据源 </a-button>
    </div>
    <div class="idm-dbd-tablebox">
      <a-table
        :columns="columns"
        :data-source="dataRows"
        :loading="loading"
        :locale="{ emptyText: '暂无数据源' }"
        :pagination="{
          current: current,
          'pageSize(.sync)': pageSize,
          total: totalCount,
        }"
        @change="changePage"
        rowKey="id"
      >
        <div slot="action" slot-scope="text, record, index">
          <a @click="editDataRow(record, index)">编辑</a>
          <a-divider style="margin:0 5px" type="vertical" />
          <a @click="showDataSourceDebugFormModal(record, index)">调试</a>
          <a-divider style="margin:0 5px" type="vertical" />
          <a @click="delDataRow(record, index)">删除</a>
          <a-divider style="margin:0 5px" type="vertical" />
          <a @click="copyDataRow(record, index)">复制</a>
        </div>
        <div slot="tags" slot-scope="text">
          <template v-for="(item,tindex) in text.split(',')" >
            <a-tag :key="tindex" v-if="item">{{item}}</a-tag>
          </template>
        </div>
        <div slot="type" slot-scope="text">
          {{ ConditionType.filter((item) => item.value == text).length?ConditionType.filter((item) => item.value == text)[0].text:"" }}
        </div>
        <div slot="groupId" slot-scope="text">
          {{ ConditionGroup.filter((item) => item.value == text).length?ConditionGroup.filter((item) => item.value == text)[0].text:"" }}
        </div>
        <div slot="expandedRowRender" slot-scope="record" style="margin: 0">
          <div style="margin-bottom:5px;font-weight: bold;">基本信息</div>
          <a-descriptions bordered size="small" column="2">
            <a-descriptions-item label="作者">
                  {{record.author}}
            </a-descriptions-item>
            <a-descriptions-item label="共享属性">
                  {{record.shareType=="0"?"私有":"共享"}}
            </a-descriptions-item>
            <a-descriptions-item label="排序">
                  {{record.itemIndex}}
            </a-descriptions-item>
            <a-descriptions-item v-if="record.productNames" label="产品标签" :span="3">
              <template v-for="(item,tindex) in record.productNames.split(',')" >
                <a-tag :key="tindex" v-if="item">{{item}}</a-tag>
              </template>
            </a-descriptions-item>
            <a-descriptions-item label="适用组件" :span="3">
              <template v-for="(item,tindex) in record.moduleNames.split(',')" >
                <a-tag :key="tindex" v-if="item">{{item}}</a-tag>
              </template>
            </a-descriptions-item>
            <a-descriptions-item label="数据源标签" :span="3">
              <template v-for="(item,tindex) in record.tags.split(',')" >
                <a-tag :key="tindex" v-if="item">{{item}}</a-tag>
              </template>
            </a-descriptions-item>
            <a-descriptions-item label="描述" :span="3">
              {{record.remark}}
            </a-descriptions-item>
          </a-descriptions>
          <div style="margin-top:10px">
            <div style="margin-bottom:5px;font-weight: bold;">详细信息</div>
            <!--接口API-->
            <div v-if="record.type=='1'">
              <a-descriptions bordered size="small" :column="3">
                <a-descriptions-item label="加载类型">
                  {{record.loadType=="0"?'前端请求':'后端转发请求'}}
                </a-descriptions-item>
                <a-descriptions-item label="请求方式">
                  {{record.requestType}}
                </a-descriptions-item>
                <a-descriptions-item label="支持跨域">
                  {{record.crossOrigin=="1"?'支持':'不支持'}}
                </a-descriptions-item>
                <a-descriptions-item label="请求地址" :span="2">
                  {{record.api}}
                </a-descriptions-item>
                <a-descriptions-item label="超时时长(毫秒)">
                  {{record.timeout}}
                </a-descriptions-item>
                <a-descriptions-item label="请求参数" :span="3">
                  {{record.paramJson}}
                </a-descriptions-item>
                <a-descriptions-item label="请求头信息" :span="3">
                  {{record.headerJson}}
                </a-descriptions-item>
                <a-descriptions-item label="请求前对参数的处理函数" :span="3">
                  {{record.functionParam}}
                </a-descriptions-item>
                <a-descriptions-item label="请求成功对结果的处理函数" :span="3">
                  {{record.functionResult}}
                </a-descriptions-item>
                <a-descriptions-item label="请求失败对异常的处理函数" :span="3">
                  {{record.functionError}}
                </a-descriptions-item>
                <a-descriptions-item label="调试结果" :span="3">
                  {{record.debugResult}}
                </a-descriptions-item>
              </a-descriptions>
            </div>
            <!--静态数据-->
            <div v-else-if="record.type=='2'">
              <a-descriptions bordered size="small" :column="1">
                <a-descriptions-item label="响应数据">
                  {{record.resultJson}}
                </a-descriptions-item>
                <a-descriptions-item label="数据处理函数">
                  {{record.functionResult}}
                </a-descriptions-item>
                <a-descriptions-item label="调试结果" >
                  {{record.debugResult}}
                </a-descriptions-item>
              </a-descriptions>
            </div>
            <!--json文件-->
            <!--csv文件-->
            <div v-else-if="record.type=='3'||record.type=='5'">
              <a-descriptions bordered size="small" :column="1">
                <a-descriptions-item label="文件名">
                  {{record.fileName}} <a style="margin-left:20px" @click="downloadFile(record)">下载</a>
                </a-descriptions-item>
                <a-descriptions-item label="文件内容">
                  {{record.fileContent}}
                </a-descriptions-item>
                <a-descriptions-item label="数据处理函数">
                  {{record.functionResult}}
                </a-descriptions-item>
                <a-descriptions-item label="调试结果" >
                  {{record.debugResult}}
                </a-descriptions-item>
              </a-descriptions>
            </div>
            <!--sql语句-->
            <div v-else-if="record.type=='4'">
              <a-descriptions bordered size="small" :column="1">
                <a-descriptions-item label="驱动名称">
                  {{record.dbName}}
                </a-descriptions-item>
                <a-descriptions-item label="SQL语句">
                  {{record.dbSql}}
                </a-descriptions-item>
                <a-descriptions-item label="请求前对参数的处理函数">
                  {{record.functionParam}}
                </a-descriptions-item>
                <a-descriptions-item label="请求成功对结果的处理函数">
                  {{record.functionResult}}
                </a-descriptions-item>
                <a-descriptions-item label="请求失败对异常的处理函数">
                  {{record.functionError}}
                </a-descriptions-item>
                <a-descriptions-item label="调试结果" >
                  {{record.debugResult}}
                </a-descriptions-item>
              </a-descriptions>
            </div>
            <!--数据模型-->
            <div v-else-if="record.type=='6'">
              <a-descriptions bordered size="small" :column="1">
                <a-descriptions-item label="数据模型">
                  {{record.datamodelName}}
                </a-descriptions-item>
                <a-descriptions-item label="调试结果" >
                  {{record.debugResult}}
                </a-descriptions-item>
              </a-descriptions>
            </div>
            
          </div>
        </div>
      </a-table>
    </div>
    <DataSourceForm
      ref="DataSourceForm"
      :visible="DataSourceFormVisible"
      :defaultValue.sync="DataSourceFormDefaultData"
      :ConditionGroup="ConditionGroup"
      :ConditionType="ConditionType"
      :ConditionModuleList="ConditionModuleList"
      :ConditionProductList="ConditionProductList"
      :conditionObjectRetain.sync="conditionObjectRetain"
      :conditionObject.sync="conditionObject"
      :destroyOnClose="true"
      @cancel="DataSourceFormVisible=false;DataSourceFormDefaultData = {}"
      @create="saveCustomModuleFormHandleCreate"
    />
    <DataSourceFormDebug
      ref="DataSourceFormDebug"
      :visible="DataSourceFormDebugVisible"
      :defaultValue.sync="DataSourceFormDebugDefaultData"
      destroyOnClose
      @cancel="DataSourceFormDebugVisible=false;DataSourceFormDebugDefaultData = {}"
    />
  </div>
</template>

<script>
const columns = [
  {
    title: "数据源类型",
    dataIndex: "type",
    key: "type",
    scopedSlots: { customRender: "type" },
  },
  { title: "数据源名称", dataIndex: "title", key: "title" },
  { title: "所属分组", dataIndex: "groupId", key: "groupId",scopedSlots: { customRender: "groupId" } },
  // { title: "数据源标签", dataIndex: "tags", key: "tags",scopedSlots: { customRender: "tags" } },
  { title: "描述", dataIndex: "remark", key: "remark",ellipsis: true },
  {
    title: "操作",
    dataIndex: "",
    key: "x",
    scopedSlots: { customRender: "action" },
  },
];
import DataSourceForm from '../innerComponents/DataSourceForm.vue'
import DataSourceFormDebug from '../innerComponents/DataSourceFormDebug.vue'
export default {
  name: "IDataSourceActionPanel",
  components:{
    DataSourceForm,
    DataSourceFormDebug
  },
  data() {
    return {
      conditionObject:{},
      conditionObjectRetain:{},
      moduleObject:{},
      propData:this.$root.propData.compositeAttr||{
        fontContent:"Hello Word"
      },
      loading: false,
      dataRows: [],
      columns,
      pageSize: 10,
      current: 1,
      totalCount: 0,
      condition: {
        TYPE: "",
        GROUP_ID: "",
        moduleList: [],
        productList:[],
        searchText: "",
      },
      ConditionGroup:
        IDM.setting.develop.dataSourceConditionGroup instanceof Array
          ? [{ text: "全部", value: "" }].concat(
              IDM.setting.develop.dataSourceConditionGroup
            )
          : [],
      ConditionType:
        IDM.setting.develop.dataSourceConditionType instanceof Array
          ? [{ text: "全部", value: "" }].concat(
              IDM.setting.develop.dataSourceConditionType
            )
          : [],
      ConditionModuleList:
        IDM.setting.develop.dataSourceConditionModuleList instanceof Array
          ? [].concat(IDM.setting.develop.dataSourceConditionModuleList)
          : [],
      ConditionProductList:
        IDM.setting.develop.dataSourceConditionProductList instanceof Array
          ? [].concat(IDM.setting.develop.dataSourceConditionProductList)
          : [],
      DataSourceFormVisible:false,
      DataSourceFormDefaultData:{},
      DataSourceFormDebugVisible:false,
      DataSourceFormDebugDefaultData:{}
    };
  },
  created() {
    this.moduleObject = this.$root.moduleObject
    let that = this;
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
        that.ConditionGroup = resultData;
      });
    } else if (
      IDM.type(IDM.setting.develop.dataSourceConditionGroup) == "string"
    ) {
      this.ConditionGroup = IDM.develop.cacheData.DataSourceConditionGroupList;
    }
    //类型分组
    if (
      !IDM.develop.cacheData.DataSourceConditionTypeList &&
      IDM.type(IDM.setting.develop.dataSourceConditionType) == "string"
    ) {
      IDM.http.get(IDM.setting.develop.dataSourceConditionType).then((res) => {
        let resultData = [{ text: "全部", value: "" }];
        if (res.data.code == 200) {
          resultData = resultData.concat(res.data.data);
        }
        IDM.develop.cacheData.DataSourceConditionTypeList = resultData;
        that.ConditionType = resultData;
      });
    } else if (
      IDM.type(IDM.setting.develop.dataSourceConditionType) == "string"
    ) {
      this.ConditionType = IDM.develop.cacheData.DataSourceConditionTypeList;
    }
    //适配组件分组
    if (
      !IDM.develop.cacheData.DataSourceConditionModuleList &&
      IDM.type(IDM.setting.develop.dataSourceConditionModuleList) == "string"
    ) {
      IDM.http
        .get(IDM.setting.develop.dataSourceConditionModuleList)
        .then((res) => {
          let resultData = [];
          if (res.data.code == 200) {
            resultData = resultData.concat(res.data.data);
          }
          IDM.develop.cacheData.DataSourceConditionModuleList = resultData;
          that.ConditionModuleList = resultData;
        });
    } else if (
      IDM.type(IDM.setting.develop.dataSourceConditionModuleList) == "string"
    ) {
      this.ConditionModuleList =
        IDM.develop.cacheData.DataSourceConditionModuleList;
    }
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
          that.ConditionProductList = resultData;
        });
    } else if (
      IDM.type(IDM.setting.develop.dataSourceConditionProductList) == "string"
    ) {
      this.ConditionProductList =
        IDM.develop.cacheData.DataSourceConditionProductList;
    }
    this.convertAttrToStyleObject();

  },
  mounted() {},
  computed: {},
  destroyed() {},
  methods: {
    /**
     * 提供父级组件调用的刷新prop数据组件
     */
    propDataWatchHandle(propData){
      this.propData = propData.compositeAttr||{};
      this.convertAttrToStyleObject();
    },
    /**
     * 把属性转换成样式对象
     */
    convertAttrToStyleObject(){
      var styleObject = {};
      if(this.propData.bgSize&&this.propData.bgSize=="custom"){
        styleObject["background-size"]=(this.propData.bgSizeWidth?this.propData.bgSizeWidth.inputVal+this.propData.bgSizeWidth.selectVal:"auto")+" "+(this.propData.bgSizeHeight?this.propData.bgSizeHeight.inputVal+this.propData.bgSizeHeight.selectVal:"auto")
      }else if(this.propData.bgSize){
        styleObject["background-size"]=this.propData.bgSize;
      }
      if(this.propData.positionX&&this.propData.positionX.inputVal){
        styleObject["background-position-x"]=this.propData.positionX.inputVal+this.propData.positionX.selectVal;
      }
      if(this.propData.positionY&&this.propData.positionY.inputVal){
        styleObject["background-position-y"]=this.propData.positionY.inputVal+this.propData.positionY.selectVal;
      }
      for (const key in this.propData) {
        if (this.propData.hasOwnProperty.call(this.propData, key)) {
          const element = this.propData[key];
          if(!element&&element!==false&&element!=0){
            continue;
          }
          switch (key) {
            case "width":
            case "height":
              styleObject[key]=element;
              break;
            case "bgColor":
              if(element&&element.hex8){
                styleObject["background-color"]=element.hex8;
              }
              break;
            case "box":
              if(element.marginTopVal){
                styleObject["margin-top"]=`${element.marginTopVal}`;
              }
              if(element.marginRightVal){
                styleObject["margin-right"]=`${element.marginRightVal}`;
              }
              if(element.marginBottomVal){
                styleObject["margin-bottom"]=`${element.marginBottomVal}`;
              }
              if(element.marginLeftVal){
                styleObject["margin-left"]=`${element.marginLeftVal}`;
              }
              if(element.paddingTopVal){
                styleObject["padding-top"]=`${element.paddingTopVal}`;
              }
              if(element.paddingRightVal){
                styleObject["padding-right"]=`${element.paddingRightVal}`;
              }
              if(element.paddingBottomVal){
                styleObject["padding-bottom"]=`${element.paddingBottomVal}`;
              }
              if(element.paddingLeftVal){
                styleObject["padding-left"]=`${element.paddingLeftVal}`;
              }
              break;
            case "bgImgUrl":
              styleObject["background-image"]=`url(${window.IDM.url.getWebPath(element)})`;
              break;
            case "positionX":
              //背景横向偏移
              
              break;
            case "positionY":
              //背景纵向偏移
              
              break;
            case "bgRepeat":
              //平铺模式
                styleObject["background-repeat"]=element;
              break;
            case "bgAttachment":
              //背景模式
                styleObject["background-attachment"]=element;
              break;
            case "border":
              if(element.border.top.width>0){
                styleObject["border-top-width"]=element.border.top.width+element.border.top.widthUnit;
                styleObject["border-top-style"]=element.border.top.style;
                if(element.border.top.colors.hex8){
                  styleObject["border-top-color"]=element.border.top.colors.hex8;
                }
              }
              if(element.border.right.width>0){
                styleObject["border-right-width"]=element.border.right.width+element.border.right.widthUnit;
                styleObject["border-right-style"]=element.border.right.style;
                if(element.border.right.colors.hex8){
                  styleObject["border-right-color"]=element.border.right.colors.hex8;
                }
              }
              if(element.border.bottom.width>0){
                styleObject["border-bottom-width"]=element.border.bottom.width+element.border.bottom.widthUnit;
                styleObject["border-bottom-style"]=element.border.bottom.style;
                if(element.border.bottom.colors.hex8){
                  styleObject["border-bottom-color"]=element.border.bottom.colors.hex8;
                }
              }
              if(element.border.left.width>0){
                styleObject["border-left-width"]=element.border.left.width+element.border.left.widthUnit;
                styleObject["border-left-style"]=element.border.left.style;
                if(element.border.left.colors.hex8){
                  styleObject["border-left-color"]=element.border.left.colors.hex8;
                }
              }
              
              styleObject["border-top-left-radius"]=element.radius.leftTop.radius+element.radius.leftTop.radiusUnit;
              styleObject["border-top-right-radius"]=element.radius.rightTop.radius+element.radius.rightTop.radiusUnit;
              styleObject["border-bottom-left-radius"]=element.radius.leftBottom.radius+element.radius.leftBottom.radiusUnit;
              styleObject["border-bottom-right-radius"]=element.radius.rightBottom.radius+element.radius.rightBottom.radiusUnit;
              break;
            case "font":
              styleObject["font-family"]=element.fontFamily;
              if(element.fontColors.hex8){
                styleObject["color"]=element.fontColors.hex8;
              }
              styleObject["font-weight"]=element.fontWeight&&element.fontWeight.split(" ")[0];
              styleObject["font-style"]=element.fontStyle;
              styleObject["font-size"]=element.fontSize+element.fontSizeUnit;
              styleObject["line-height"]=element.fontLineHeight+(element.fontLineHeightUnit=="-"?"":element.fontLineHeightUnit);
              styleObject["text-align"]=element.fontTextAlign;
              styleObject["text-decoration"]=element.fontDecoration;
              break;
          }
        }
      }
      window.IDM.setStyleToPageHead(this.moduleObject.id,styleObject);
      this.initData();
    },
    downloadFile(record){
        const elink = document.createElement('a');
        elink.download = record.fileName;
        elink.style.display = 'none';
        const blob = new Blob([record.fileContent], { type: 'application/'+record.fileName.split(".")[record.fileName.split(".").length-1] });
        const href = URL.createObjectURL(blob);
        elink.href = href;
        document.body.appendChild(elink);
        elink.click();
        document.body.removeChild(elink);
        window.URL.revokeObjectURL(href);
    },
    editDataRow(record, index){
      this.showDataSourceFormModal(record);
    },
    delDataRow(record, index){
      let that = this;
      if(!IDM.setting.api.dataSourceDeleteApi){
        IDM.message.warning("删除接口未配置！请在setting.js文件[IDM.setting.api.dataSourceDeleteApi]下面配置接口地址。")
        return;
      }
      IDM.http.post(IDM.setting.api.dataSourceDeleteApi,{id:record.id}).then(res=>{
        if (res.data.code == 200) {
            IDM.message.success("删除成功！");
        } else {
          IDM.message.error("删除失败！"+res.data.message);
        }
        that.reload(true);
      }).catch(error=>{
          if(error.response.status=="30001"){
            IDM.message.error("删除失败，请重新登录再回来操作！");
          }else{
            IDM.message.error("删除失败！"+error.message);
          }
      })
    },
    copyDataRow(record, index){
      let that = this;
      if(!IDM.setting.api.dataSourceCopyApi){
        IDM.message.warning("复制接口未配置！请在setting.js文件[IDM.setting.api.dataSourceCopyApi]下面配置接口地址。")
        return;
      }
      IDM.http.post(IDM.setting.api.dataSourceCopyApi,{id:record.id}).then(res=>{
        if (res.data.code == 200) {
            IDM.message.success("复制成功！");
        } else {
          IDM.message.error("复制失败！"+res.data.message);
        }
        that.reload(true);
      }).catch(error=>{
          if(error.response.status=="30001"){
            IDM.message.error("复制失败，请重新登录再回来操作！");
          }else{
            IDM.message.error("复制失败！"+error.message);
          }
      })
    },
    saveCustomModuleFormHandleCreate(){
      let that = this;
      const form = this.$refs.DataSourceForm.form;
      form.validateFields((err, values) => {
        console.log("🚀 ~ file: DataSourceActionPanel.vue ~ line 254 ~ form.validateFields ~ values", values)
        if (err) {
          return;
        }
        values.id = that.DataSourceFormDefaultData.id||"";
        values.tags = values.tags?values.tags.join(","):"";
        let layerIndex = IDM.layer.load(2)
        this.saveDataSourceData(values).then((res) => {
            if (res.data.code == 200) {
                IDM.message.success("保存成功！");
            } else {
              IDM.message.error("保存失败！"+res.data.message);
            }
            IDM.layer.close(layerIndex)
            that.DataSourceFormVisible = false;
            that.reload(true);
            form.resetFields();
          }).catch(error=>{
            IDM.layer.close(layerIndex)
            if(error.response.status=="30001"){
              IDM.message.error("保存失败，请重新登录再回来保存！");
            }else{
              IDM.message.error("保存失败！"+error.message);
            }
            // form.resetFields();
            // that.DataSourceFormVisible = false;
        });
      });
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
    showDataSourceDebugFormModal(fromInfo){
      fromInfo = _.cloneDeep(fromInfo)
      fromInfo.type=fromInfo.type+"";
      fromInfo.isEditInfo = true;
      this.DataSourceFormDebugDefaultData = fromInfo;
      this.DataSourceFormDebugVisible = true;
    },
    showDataSourceFormModal(fromInfo){
      fromInfo = _.cloneDeep(fromInfo)
      if(fromInfo){
        fromInfo.isEditInfo = true;
        fromInfo.moduleArray = [];
        if(fromInfo.moduleIds){
          let moduleids = fromInfo.moduleIds.split(","),modulenames = fromInfo.moduleNames.split(",");
          for (let index = 0; index < moduleids.length; index++) {
            const element = moduleids[index];
            fromInfo.moduleArray.push({key:element,label:modulenames[index]});
          }
        }
        fromInfo.productArray = [];
        if(fromInfo.productIds){
          let productids = fromInfo.productIds.split(","),productnames = fromInfo.productNames.split(",");
          for (let index = 0; index < productids.length; index++) {
            const element = productids[index];
            fromInfo.productArray.push({key:element,label:productnames[index]});
          }
        }
        fromInfo.tags?fromInfo.tags = fromInfo.tags.split(","):null;
        fromInfo.type=fromInfo.type+"";
        fromInfo.crossOrigin = fromInfo.crossOrigin=="1";
        fromInfo.loadType=fromInfo.loadType+"";
        if(fromInfo.fileName){
          fromInfo.file_name=[{
            "uid":IDM.uuid(),
            name:fromInfo.fileName,
            "status": "done",
            "content":fromInfo.fileContent,
            "src":fromInfo.fileName
          }]
        }
        // if(fromInfo.paramJson){
        //   fromInfo.paramJson = JSON.parse(fromInfo.paramJson)
        // }
        // if(fromInfo.headerJson){
        //   fromInfo.headerJson = JSON.parse(fromInfo.headerJson)
        // }
        this.DataSourceFormDefaultData = fromInfo;
      }else{
        this.DataSourceFormDefaultData = {};
      }
      this.DataSourceFormVisible = true;
    },
    resetCondition(){
      this.condition = {
        TYPE: "",
        GROUP_ID: "",
        moduleList: [],
        searchText: "",
      }
      this.reload(true);
    },
    changePage(pagination) {
      if(pagination&&pagination.current){
        this.current = pagination.current;
        this.pageSize = pagination.pageSize;
      }
      //请求数据源
      this.initData();
    },
    change() {
      this.reload(true);
    },
    onReInitData(conditionObject){
      this.conditionObject = conditionObject||this.conditionObject||{};
      this.reload(true);
    },
    onReInitDataMsgKey(conditionObject,messageKey){
      if(this.propData.conditionRetainArray&&this.propData.conditionRetainArray.split(",").indexOf(messageKey)>-1){
        this.conditionObjectRetain[messageKey] = conditionObject;
      }else{
        this.conditionObject[messageKey] = conditionObject;
      }
      this.reload(true);
    },
    /**
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
      let that = this;
      if (!IDM.setting.api.dataSourceFetchListApi&&!IDM.setting.mockurl.dataSourceFetchListApi) {
        return;
      }
      that.loading = true;
      var params = { ...this.condition };
      if (params.moduleList && params.moduleList.length) {
        let MODULE_IDS = [];
        params.moduleList.forEach((element) => {
          MODULE_IDS.push({ value: element });
        });
        params.MODULE_IDS = JSON.stringify(MODULE_IDS);
      }
      if (params.productList && params.productList.length) {
        let PRODUCT_IDS = [];
        params.productList.forEach((element) => {
          PRODUCT_IDS.push({ value: element });
        });
        params.PRODUCT_IDS = JSON.stringify(PRODUCT_IDS);
      }
      
      this.conditionObject&&Object.keys(this.conditionObject).forEach(key=>{
        params[key] = typeof this.conditionObject[key]=='object'?JSON.stringify(this.conditionObject[key]):this.conditionObject[key];
      })
      this.conditionObjectRetain&&Object.keys(this.conditionObjectRetain).forEach(key=>{
        params[key] = typeof this.conditionObjectRetain[key]=='object'?JSON.stringify(this.conditionObjectRetain[key]):this.conditionObjectRetain[key];
      })
      params["pageIndex"] = this.current;
      params["pageSize"] = this.pageSize;
      IDM.http
        .get(IDM.setting.api.dataSourceFetchListApi||IDM.setting.mockurl.dataSourceFetchListApi, params)
        .then((res) => {
          let resultData = res && res.data;
          that.resultChangeTableData(resultData);
        })
        .catch(function (error) {
          that.loading = false;
        });
    },
    /**
     * 数据改变事件
     */
    resultChangeTableData(listResultData) {
      this.loading = false;
      //设置数据源
      var rows = listResultData
        ? listResultData.data && listResultData.data.rows
        : [];
      if (rows.length == 0) {
        rows = listResultData && listResultData.rows;
      }
      this.dataRows = rows;
      var totalCount = listResultData
        ? listResultData.data && listResultData.data.total
        : -1;
      if (totalCount == -1) {
        totalCount = listResultData && listResultData.total;
      }
      if (totalCount && totalCount != -1) {
        this.totalCount = totalCount;
      }
    },
    /**
     * 分页、排序、筛选变化时触发
     */
    handleTableChange(pagination, filters, sorter, { currentDataSource }) {
      let that = this;
      this.pageSize = pagination.pageSize;
      this.current = pagination.current;
      this.totalCount = pagination.total;
      this.initData();
    },
    getStyle(key) {
      let styles = {};
      switch (key) {
        case "root":
          //外部样式
          break;
        default:
          break;
      }
      return styles;
    },
    /**
     * 组件通信：接收消息的方法
     * @param {
     *  type:"发送消息的时候定义的类型，这里可以自己用来要具体做什么，统一规定的type：linkageResult（组件联动传结果值）、linkageDemand（组件联动传需求值）、linkageReload（联动组件重新加载）
     * 、linkageOpenDialog（打开弹窗）、linkageCloseDialog（关闭弹窗）、linkageShowModule（显示组件）、linkageHideModule（隐藏组件）、linkageResetDefaultValue（重置默认值）"
     *  message:{发送的时候传输的消息对象数据}
     *  messageKey:"消息数据的key值，代表数据类型是什么，常用于表单交互上，比如通过这个key判断是什么数据"
     *  isAcross:如果为true则代表发送来源是其他页面的组件，默认为false
     * } object 
     */
    receiveBroadcastMessage(object){
      if(object.type&&object.type=="linkageDemand"){
        if(object.messageKey){
          this.onReInitDataMsgKey(object.message,object.messageKey);
        }else{
          this.onReInitData(object.message);
        }
      }else if(object.type&&object.type=="linkageReload"){
        this.reload(object.message&&object.message.reloadFirstPage);
      }
    },
  },
  watch: {},
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
.idm-datasource-module{
        height: 100%;
        overflow: auto;
        .idm-dbd-condition{
            display: flex;
            padding: 15px;
            &>*{
                margin-right: 15px;
            }
        }
        .idm-dbd-tablebox{
            padding: 0px 15px;
        }
        
        .ant-descriptions table{
            border-collapse:collapse !important;
        }
        .ant-tag{
            background: transparent;
        }
                  
        .ant-descriptions-item-label{
            white-space: nowrap;
        }
        .ant-descriptions-item-content{
            word-break: break-all;
        }
        .ant-descriptions-bordered .ant-descriptions-item-label,
        .ant-table-row-expand-icon{
          background: transparent;
        }
        .ant-table-fixed-header > .ant-table-content > .ant-table-scroll > .ant-table-header{
            &::-webkit-scrollbar {
                background-color: transparent;
            }
        }
        .ant-table-fixed-header > .ant-table-content > .ant-table-scroll > .ant-table-body{
            &::-webkit-scrollbar {
                width: 17px;
                height: 17px;
            }
            &::-webkit-scrollbar-thumb {
                min-height: 28px;
                border-radius: 8px;
            }
            &::-webkit-scrollbar-track-piece,&::-webkit-scrollbar-corner {
                background-color: transparent;
            }
        }
        // .idm-ant-descriptions-item-content{
        //     background-color: white !important;
        // }
      }
</style>

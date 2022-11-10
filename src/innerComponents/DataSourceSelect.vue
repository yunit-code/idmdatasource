<template>
    <a-modal :visible="visible" :maskClosable="false" wrapClassName="idm_dm_data_source_select" width="800px"
        title="选择数据源" okText='确认' cancelText='上一步' @cancel="() => $emit('closeDataSource')" @ok="handleSelect"
        :bodyStyle="{ 'padding': 0 }">
        <div class="idm-page-select-search">
            <a-select default-value="" v-model="conditionValue.TYPE" style="width: 100px" allowClear
                dropdownClassName="idm_dev_theme" @change="handleChange">
                <a-select-option v-for="(item, index) in ConditionType" :key="index" :value="item.value">
                    {{ item.text }}
                </a-select-option>
            </a-select>
            <a-select default-value="" v-model="conditionValue.GROUP_ID" style="width: 150px" allowClear
                dropdownClassName="idm_dev_theme" @change="handleChange">
                <a-select-option v-for="(item, index) in ConditionGroup" :key="index" :value="item.value">
                    {{ item.text }}
                </a-select-option>
            </a-select>
            <a-input-search placeholder="请输入关键词" v-model="conditionValue.searchText" style="width: 200px"
                @search="handleChange" />
        </div>
        <!--内容-->
        <div class="idm-page-select-content scrollbar_style" @scroll="scrollHandle">
            <div class="idm-page-select-content-item" @click="selectModule(item)" v-for="(item, index) in resultList"
                :key="index">
                <div class="idm-psc-item-inner" :class="{ 'active': selectValue.id === item.id }">
                    <div>
                        <div class="idm-psc-item-inner-title">
                            <label>{{ item.title }}</label>
                            <a-tag :color="tagColorArray[item.type]">
                                {{ ConditionType.filter((sitem) => sitem.value ==
                                        item.type).length ? ConditionType.filter((sitem) => sitem.value == item.type)[0].text :
                                        ""
                                }}
                            </a-tag>
                            <a-tag color="blue">
                                {{ ConditionGroup.filter((sitem) => sitem.value ==
                                        item.groupId).length ? ConditionGroup.filter((sitem) => sitem.value ==
                                            item.groupId)[0].text : ""
                                }}
                            </a-tag>
                            <a-tag>
                                {{ item.shareType == "0" ? "私有" : "共享" }}
                            </a-tag>
                        </div>
                        <div class="idm-psc-item-inner-desc" style="height:auto;max-height:46px">
                            {{ item.remark }}
                        </div>
                    </div>
                    <svg-icon icon-class="rb-select-icon" class="rb-select-icon" />
                </div>
            </div>
            <div class="idm-page-select-content-loading" style="text-align: center;padding:20px 0px;">
                <a-spin v-if="loading"></a-spin>
                {{ loadEnd ? resultList.length == 0 ? "暂无数据" : "没有更多了" : "" }}
            </div>
        </div>
    </a-modal>
</template>

<script>
export default {
    name: 'DataSourceSelect',
    data() {
        return {
            tagColorArray: ["", "#f50", "#108ee9", "#fdc500", "#2dd300", "#4250ff"],
            searchValue: "",
            ConditionType: IDM.setting.develop.dataSourceConditionType instanceof Array
                ? [{ text: "全部", value: "" }].concat(
                    IDM.setting.develop.dataSourceConditionType
                )
                : [],
            ConditionGroup: IDM.setting.develop.dataSourceConditionGroup instanceof Array
                ? [{ text: "全部", value: "" }].concat(
                    IDM.setting.develop.dataSourceConditionGroup
                )
                : [],
            conditionValue: {
                pageIndex: 1,
                pageSize: 10,
                TYPE: "",
                GROUP_ID: "",
                searchText: ""
            },
            totalCount: 0,
            loading: false,
            loadEnd: false,
            resultList: [],
            selectValue: {}
        }
    },
    props: ['visible'],
    model: {
        prop: 'visible',
        event: 'handleClose'
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
                this.ConditionType = resultData;
            });
        } else if (
            IDM.type(IDM.setting.develop.dataSourceConditionType) == "string"
        ) {
            this.ConditionType = IDM.develop.cacheData.DataSourceConditionTypeList;
        }
        this.loadData(true);
    },
    methods: {
        handleSelect() {
            if (!this.selectValue.id) return IDM.message.warning('至少选择一项')
            this.$emit('handleDataSourceSelect', this.selectValue)
        },
        scrollHandle(e) {
            // console.log("gundong",e.target);
            if (e.target.scrollHeight - e.target.scrollTop - e.target.clientHeight <= 100) {
                if (!this.loading && !this.loadEnd) {
                    this.conditionValue.pageIndex = this.conditionValue.pageIndex + 1;
                    this.loadData();
                }
            }
        },
        handleChange() {
            this.selectValue = {}
            this.conditionValue.pageIndex = 1;
            this.loadEnd = false;
            this.recommendLoadingEnd = false;
            this.loadData(true);
        },
        loadData(isreload) {
            let that = this;
            if ((!IDM.setting.api.dataSourceFetchListApi && !IDM.setting.mockurl.dataSourceFetchListApi) || that.loading || that.recommendLoading) {
                return
            }
            if (isreload) {
                that.resultList = [];
            }
            that.loading = true;
            let param = {
                pageIndex: this.conditionValue.pageIndex,
                pageSize: this.conditionValue.pageSize,
                searchText: this.conditionValue.searchText
            };
            if (this.conditionValue.TYPE) {
                param["TYPE"] = JSON.stringify([{ value: this.conditionValue.TYPE }])
            }
            if (this.conditionValue.GROUP_ID) {
                param["GROUP_ID"] = JSON.stringify([{ value: this.conditionValue.GROUP_ID }])
            }
            IDM.http.get(IDM.setting.api.dataSourceFetchListApi || IDM.setting.mockurl.dataSourceFetchListApi, param).then(res => {
                if (res && res.data && res.data.code == "200" && res.data.data && res.data.data.rows) {
                    if (res.data.data.rows.length < that.conditionValue.pageSize) {
                        that.loadEnd = true;
                    }
                    that.resultList = that.resultList.concat(res.data.data.rows);
                    that.totalCount = res.data.data.total;
                }
                that.loading = false;
            }).catch(err => {
                IDM.message.error(err.message)
                that.loading = false;
            })
        },
        selectModule(pitem) {
            this.selectValue = pitem
        },
    }
}
</script>

<style lang="scss">
.idm-page-select-search {
    display: flex;
    padding-top: 12px;
    margin: 0 16px;

    &>* {
        margin-right: 10px !important;
    }
}

.scrollbar_style {
    &::-webkit-scrollbar {
        width: 8px;
        height: 8px;
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

.idm_dm_data_source_select {

    ::v-deep(.ant-modal-footer) {
        text-align: left;
    }
}

.idm-page-select-content {
    height: 400px;
    margin: 10px 16px 0;
    overflow-y: auto;

    .idm-page-select-content-item {
        padding: 10px 0;
        margin: 0 5px 0 0;

        &+.idm-page-select-content-item {
            border-top: 1px solid #CCC;
        }

        .idm-psc-item-inner {
            display: flex;
            cursor: pointer;
            position: relative;

            .idm-psc-item-inner-image {
                height: 88px;
                width: 140px;
                flex-shrink: 0;
                position: relative;

                img {
                    width: 100%;
                    height: 100%;
                }

                div {
                    display: none;
                    position: absolute;
                    top: 50%;
                    margin-top: -13px;
                    left: 50%;
                    margin-left: -43px;
                    cursor: pointer;
                    height: 26px;
                    line-height: 26px;
                    border-radius: 13px;
                    padding: 0px 15px;
                    background-color: rgba(0, 0, 0, .6);
                    color: white;
                    font-size: 14px;

                    &:hover {
                        background-color: rgba(0, 0, 0, .8);
                    }
                }
            }

            .idm-psc-item-inner-title {
                display: flex;
                align-items: center;
                font-size: 16px;
                padding: 5px 10px;

                label {
                    margin-right: 20px;
                }

                .idm-ant-tag-has-color {
                    border-color: transparent !important;
                }

                .idm-ant-tag-blue {
                    color: #1890ff !important;
                    background: #e6f7ff !important;
                    border-color: #91d5ff !important;
                }
            }

            .idm-psc-item-inner-desc {
                font-size: 13px;
                padding: 5px 10px;
                height: 46px;
                overflow: hidden;
            }

            .idm-psc-item-inner-recomment {
                font-size: 12px;
                padding: 5px 10px;
            }

            border: 1px solid transparent;

            &:hover {
                border-color: rgba(0, 0, 0, .2);
                background-color: rgba(0, 0, 0, .05);
            }

            &.active {
                border-color: rgba(0, 0, 0, .2);
                background-color: rgba(0, 0, 0, .05);

                .rb-select-icon {
                    color: rgba(0, 0, 0, .2);
                }
            }

            .rb-select-icon {
                color: rgba(0, 0, 0, .2);
            }

            &:hover {
                .idm-psc-item-inner-image {
                    div {
                        display: block;
                    }
                }

                .rb-select-icon {
                    display: block;
                }
            }

            &.active {
                .rb-select-icon {
                    display: block;
                }
            }

            .rb-select-icon {
                fill: currentColor;
                position: absolute;
                right: 0;
                bottom: 0;
                font-size: 30px;
                display: none;
            }
        }
    }

    .idm-page-select-content-loading {
        color: #666;
    }
}
</style>
<template>
    <a-modal :visible="visible" :footer="null" wrapClassName="idm_dm_records_drawer" :bodyStyle="{ 'padding': '0' }"
        width="800px" :title="`${defaultValue.title}更新记录`" @cancel="$emit('change', false)">
        <a-table class="idm_dm_records_drawer_table" :columns="columns" size="small" :data-source="dataRows"
            :loading="tableLoading" :locale="{ emptyText: '没有更新记录' }" :pagination="{
                current: current,
                'pageSize(.sync)': pageSize,
                total: totalCount,
            }" @change="changePage" rowKey="id"></a-table>
    </a-modal>
</template>

<script>
import apis from '../api/dataModalUrls'
const columns = [
    {
        title: '更新时间',
        dataIndex: 'createTime',
        key: 'createTime',
        fixed: 'left'
    },
    {
        title: '终端',
        dataIndex: 'loginClient',
        key: 'loginClient'
    },
    {
        title: 'ip地址',
        dataIndex: 'clientIp',
        key: 'clientIp',
    },
    {
        title: '操作人',
        dataIndex: 'createUName',
        key: 'createUName'
    },
];
export default {
    name: 'DataModalUpdateRecordsModal',
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
    },
    watch: {
        visible: {
            handler(newV) {
                if (newV) {
                    this.tableDataReload()
                }
            }
        }
    },
    data() {
        return {
            columns,
            dataRows: [],
            tableLoading: false,
            current: 1,
            pageSize: 10,
            totalCount: 0
        }
    },
    methods: {
        // 重新加载
        tableDataReload() {
            this.current = 1;
            this.dataRows = []
            this.handleGetRecords()
        },
        //分页事件
        changePage(pagination) {
            if (pagination && pagination.current) {
                this.current = pagination.current;
                this.pageSize = pagination.pageSize;
            }
            this.handleGetRecords()
        },
        handleGetRecords() {
            this.tableLoading = true
            apis.requestUpdateRecords({
                objectId: this.defaultValue.id,
                timeType: 2,
                pageIndex: this.current,
                pageSize: this.pageSize
            }).then(res => {
                if (res.status == 200 && res.data.code == 200) {
                    this.dataRows = res.data.data.rows
                    this.totalCount = res.data.data.total
                } else {
                    IDM.message.error(res?.data?.message || '获取记录失败')
                }
            })
                .catch(function (error) {
                    IDM.message.error('获取记录失败')
                }).finally(() => {
                    this.tableLoading = false
                })
        }
    }
}
</script>

<style lang="scss" scoped>
.idm_dm_records_drawer_table {
    ::v-deep(.ant-table-small) {
        border: 0;
        border-bottom: 1px solid #e8e8e8;
        border-radius: 0;
    }

    ::v-deep(.ant-table-pagination) {
        margin-right: 20px;
    }

    ::v-deep(.ant-table-body) {
        margin: 0 !important;
    }

    ::v-deep(.ant-table-fixed-left) {
        left: 16px;
    }
}
</style>
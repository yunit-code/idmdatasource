const customParams = {
    headers: { 'Content-Type': 'application/json;charset=UTF-8' }
}
export default {
    // 测试数据
    requestAnalysisJson: (params) => IDM.http.post('/ctrl/idm/datamodel/analysisJson', params, customParams),
    // 保存
    requestSaveDataModel: (params) => IDM.http.post('/ctrl/idm/datamodel/save', params, customParams),
    // 列表
    requestModelList: (params) => IDM.http.get('/ctrl/idm/datamodel/getList', params),
    // 更新
    requestUpdateDataModel: (params) => IDM.http.post('/ctrl/idm/datamodel/updateData', params, customParams),
    // 删除
    requestDeleteDataModel: (params) => IDM.http.post('/ctrl/idm/datamodel/delete', params, customParams),
    // 日志
    requestUpdateRecords: (params) => IDM.http.get('/ctrl/idm/logger/fetchLoggerListPageData', params)
}

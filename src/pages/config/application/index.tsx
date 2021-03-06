import "../table.less"

import { Button, Col, Form, Input, PaginationProps, Popconfirm, Row, Spin, Table, Tooltip, message } from "antd";
import { DeleteOutlined, EditOutlined, FundViewOutlined, SettingOutlined, WarningOutlined } from "@ant-design/icons";
import { formItemLayout, tailLayout } from "@/constans/layout/optionlayout";
import { initPaginationConfig, tacitPagingProps } from "../../../shared/ajax/request"
import { useEffect, useState } from "react";

import { IApplicationService } from "@/domain/applications/iapplication-service";
import { IocTypes } from "@/shared/config/ioc-types";
import Operation from "./operation";
import { OperationTypeEnum } from "@/shared/operation/operationType";
import { right } from "@antv/x6/lib/registry/port-layout/line";
import { useHistory } from "react-router-dom"
import useHookProvider from "@/shared/customHooks/ioc-hook-provider";

const ApplicationPage = () => {
    const history = useHistory();
    const _applicationService: IApplicationService = useHookProvider(IocTypes.ApplicationService);
    const [tableData, setTableData] = useState<Array<any>>([]);
    const [loading, setloading] = useState<boolean>(false);
    const [paginationConfig, setPaginationConfig] = useState<initPaginationConfig>(new initPaginationConfig());
    const [subOperationElement, setOperationElement] = useState<any>(null);
    const [formData] = Form.useForm();
    const pagination: PaginationProps = {
        ...tacitPagingProps,
        total: paginationConfig.total,
        current: paginationConfig.current,
        pageSize: paginationConfig.pageSize,
        onShowSizeChange: (current: number, pageSize: number) => {

            setPaginationConfig((Pagination) => {
                Pagination.pageSize = pageSize;
                Pagination.current = current;
                return Pagination;
            });
            getTable();

        },
        onChange: (page: number, pageSize?: number) => {

            setPaginationConfig((Pagination) => {
                Pagination.current = page;
                if (pageSize) {
                    Pagination.pageSize = pageSize;
                }
                return Pagination;
            });
            getTable();
        }
    };
    const [globalLoading, setGlobalLoading] = useState<boolean>(false);
    const columns = [
        {
            title: "???????????????",
            dataIndex: "englishName",
            key: "englishName",
        },
        {
            title: "???????????????",
            dataIndex: "chinessName",
            key: "chinessName",
        },
        {
            title: "????????????",
            dataIndex: "appId",
            key: "appId",
        },
        {
            title: "????????????",
            dataIndex: "departmentName",
            key: "departmentName",
        },
        {
            title: "??????",
            dataIndex: "status",
            key: "status",
        },
        {
            title: "?????????",
            dataIndex: "linkMan",
            key: "linkMan",
        },
        {
            title: "??????",
            dataIndex: "id",
            key: "id",
            render: (text: any, record: any) => {
                return <div className="table-operation">
                    <Tooltip placement="top" title="????????????">
                        <SettingOutlined style={{ color: '#108ee9', marginRight: 10, fontSize: 16 }} onClick={() => goToConfig(record.appId)} />
                    </Tooltip>
                    <Tooltip placement="top" title="??????">
                        <EditOutlined style={{ color: 'orange', marginRight: 10, fontSize: 16 }} onClick={() => editRow(record.id)} />
                    </Tooltip>


                    <Tooltip placement="top" title="??????">
                        <Popconfirm placement="top" title="?????????????" onConfirm={() => deleteRow(record.id)} icon={<WarningOutlined />}>
                            <DeleteOutlined style={{ color: 'red', fontSize: 16 }} />
                        </Popconfirm>
                    </Tooltip>
                </div>
            }
        }
    ];
    const goToConfig = (_appId: string) => {
        history.push({
            pathname: "environment",
            state: {
                appId: _appId
            }
        });
    }
    /**
     * ?????????????????????
     */
    useEffect(() => {
        getTable();
    }, [paginationConfig]);


    const onSearch = () => {

    }
    /**
     * ????????????
     * @param _id 
     */
    const editRow = (_id: any) => {
        setOperationElement(<Operation onCallbackEvent={clearElement} operationType={OperationTypeEnum.edit} id={_id} />)
    }

    /**
     * ???????????????????????????
     */
    const getTable = () => {
        setloading(true);
        setGlobalLoading(true);
        let param = { pageSize: paginationConfig.pageSize, pageIndex: paginationConfig.current }
        _applicationService.gettable(param).then((x) => {
            if (x.success) {
                setPaginationConfig((Pagination) => {
                    Pagination.total = x.result.total;
                    return Pagination;
                });
                // x.data.data.map((item: any, index: number) => {
                //     item.key = item.id;
                //     return item;
                // });
                setTableData(x.result.data);
                setloading(false);
                setGlobalLoading(false);
            }
        });

    };

    const clearElement = () => {
        setOperationElement(null);
        getTable();
    }

    const deleteRow = (_id: string) => {
        _applicationService.delete(_id).then(res => {
            if (!res.success) {
                message.error(res.errorMessage, 3)
            }
            else {
                getTable();
            }
        });
    };

    const addChange = () => {
        setOperationElement(<Operation onCallbackEvent={clearElement} operationType={OperationTypeEnum.add} />)
    }

    return (<div>
        <Spin spinning={globalLoading}>
            <Row >
                <Form form={formData}
                    name="horizontal_login" layout="inline"
                    onFinish={onSearch}>
                    <Form.Item
                        name="appId"
                        label="????????????">
                        <Input />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" onClick={() => { getTable() }}>??????</Button>
                </Form>
            </Row>
            <Row>
                <Col span="24" style={{ textAlign: 'right' }}>
                    <Button type="primary" style={{ margin: '8px 8px' }} onClick={() => { addChange() }}>??????</Button>
                </Col>
            </Row>
            <Row>
                <Col span={24}>
                    <Table bordered columns={columns} dataSource={tableData} loading={loading} pagination={pagination} scroll={{ y: 600 }} />
                    </Col>
            </Row>
            {subOperationElement}
        </Spin>
    </div>)
}
export default ApplicationPage;
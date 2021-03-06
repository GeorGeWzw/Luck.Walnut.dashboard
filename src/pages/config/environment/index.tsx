import { Button, Card, Col, Descriptions, Form, Input, Layout, List, Modal, PaginationProps, Popconfirm, Row, Spin, Table, Tag, Tooltip, message } from "antd";
import { DeleteOutlined, DeleteTwoTone, EditOutlined, FileAddTwoTone, LeftOutlined, WarningOutlined } from '@ant-design/icons';
import { formItemLayout, tailLayout } from "@/constans/layout/optionlayout";
import { initPaginationConfig, tacitPagingProps } from "../../../shared/ajax/request"
import { useEffect, useState } from "react";

import ConfigOperation from "./configOperation";
import ConfigRelease from "./configRelease";
import { IApplication } from "@/domain/applications/application";
import { IEnvironmentService } from "@/domain/environment/ienvironment-service";
import { IocTypes } from "@/shared/config/ioc-types";
import Operation from "./operation";
import { OperationTypeEnum } from "@/shared/operation/operationType";
import { useHistory } from "react-router-dom";
import useHookProvider from "@/shared/customHooks/ioc-hook-provider";

const EnvironmentPage = (props: any) => {
    const history = useHistory();

    const _environmentService: IEnvironmentService = useHookProvider(IocTypes.EnvironmentService);
    const [paginationConfig, setPaginationConfig] = useState<initPaginationConfig>(new initPaginationConfig());
    const [tableData, setTableData] = useState<Array<any>>([]);
    const [listData, setListData] = useState<Array<any>>([]);
    const [appId, setAppId] = useState<string>();
    const [applicationData, setApplicationData] = useState<IApplication>();

    const [loading, setloading] = useState<boolean>(false);
    const [globalLoading, setGlobalLoading] = useState<boolean>(false);

    const [rowId, setRowId] = useState(null);
    const [subOperationElement, setOperationElement] = useState<any>(null);
    const [configOperationElement, setconfigOperationElement] = useState<any>(null);
    const [configRelease, setConfigRelease] = useState<any>(null);

    const [currentEnvironment, setCurrentEnvironment] = useState<any>(null);

    const { Header, Footer, Sider, Content } = Layout;
    /**
     * ?????????ID
     */
    const [configid, setconfigid] = useState<any>(null);
    const [deltype, setDelType] = useState<any>(null);

    const pagination: PaginationProps = {
        ...tacitPagingProps,
        total: paginationConfig.total,
        current: paginationConfig.current,
        pageSize: paginationConfig.pageSize,
        onShowSizeChange: (current: number, pageSize: number) => {
            setPaginationConfig((Pagination) => {
                Pagination.current = current;
                Pagination.pageSize = pageSize;
                return Pagination;
            });
            getConfigTable(currentEnvironment);
        },
        onChange: (page: number, pageSize?: number) => {
            setPaginationConfig((Pagination) => {
                Pagination.current = page;
                if (pageSize) {
                    Pagination.pageSize = pageSize;
                }
                return Pagination;
            });
            getConfigTable(currentEnvironment);
        }
    };

    const columns = [
        {
            title: "?????????key",
            dataIndex: "key",
            key: "key",
            // : 100
        }, {
            title: "?????????Value",
            dataIndex: "value",
            key: "value",
        }, {
            title: "???????????????",
            dataIndex: "type",
            key: "type",
        }, {
            title: "???",
            dataIndex: "group",
            key: "group",
        }, {
            title: "????????????",
            dataIndex: "isOpen",
            key: "id",
            render: (text: any, record: any) => {
                return <div>
                    {record.isOpen ? <Tag color="cyan">???</Tag> : <Tag color="orange">???</Tag>}
                </div>
            }
        }, {
            title: "????????????",
            dataIndex: "isPublish",
            key: "id",
            render: (text: any, record: any) => {
                return <div>
                    {record.isPublish ? <Tag color="cyan">???</Tag> : <Tag color="orange">???</Tag>}
                </div>
            }
        }, {
            title: "??????",
            dataIndex: "id",
            key: "id",
            render: (text: any, record: any) => {
                return <div className="table-operation">
                    
                    <Tooltip placement="top" title="??????">
                        <EditOutlined style={{ color: 'orange', marginRight: 10, fontSize: 16 }} onClick={() => editRow(record.id)} />
                    </Tooltip>
                    <Tooltip placement="top" title="??????">
                        <Popconfirm placement="top" title="?????????????" onConfirm={() => delConfigClick(currentEnvironment.id, record.id)} icon={<WarningOutlined />}>
                            <DeleteOutlined style={{ color: 'red', fontSize: 16 }} />
                        </Popconfirm>
                    </Tooltip>
                </div>
            }
        }
    ]

    useEffect(() => {
        getEnvironmentList();
    }, [paginationConfig])
    /**
     * ??????????????????
     */
    const getEnvironmentList = () => {
        if (props.location.state.appId) {
            setAppId(props.location.state.appId)
            setGlobalLoading(true);
            _environmentService.getEnvironmentList(props.location.state.appId).then((x) => {
                if (x.success) {
                    if (x.result.environmentLists.length > 0) {
                        getConfigTable(x.result.environmentLists[0]);
                    }
                    setListData(x.result.environmentLists);
                    setApplicationData(x.result.application)
                    setGlobalLoading(false);
                }
            })
        }
    }

    /**
 * ????????????????????????
 * @param _id 
 */
    const getConfigTable = (_currentEnvironment: any) => {
        setloading(true);
        setCurrentEnvironment(_currentEnvironment);
        let param = { pageSize: paginationConfig.pageSize, pageIndex: paginationConfig.current }
        _currentEnvironment.id && _environmentService.getConfigListForEnvironmentId(_currentEnvironment.id, param).then(x => {
            if (x.success) {

                setPaginationConfig((Pagination) => {
                    Pagination.total = x.result.total;
                    return Pagination;
                });
                setTableData(x.result.data);
                setloading(false);
            }
        })
    }

    /**
     * ????????????
     * @param id 
     */
    const deleteRow = (id: any) => {
        _environmentService.deleteEnvironment(id).then(x => {
            if (x.success) {
                message.success('????????????');
                getEnvironmentList();
            } else {
                message.error(x.errorMessage, 3);
            }
        })
    }
    const backApplicationPage = () => {
        history.push({
            pathname: "application",
        });

    }

    const addChange = () => {
        setOperationElement(<Operation appId={appId} onCallbackEvent={clearsubAllocationRoleElement} operationType={OperationTypeEnum.add} />)
    }

    const clearsubAllocationRoleElement = () => {
        setOperationElement(null);
        getEnvironmentList();
    }

    const addChangeConfig = () => {
        setconfigOperationElement(<ConfigOperation onCallbackEvent={claerConfigOperation} operationType={OperationTypeEnum.add} envId={currentEnvironment.id}></ConfigOperation>)
    }
    const claerConfigOperation = () => {
        setconfigOperationElement(null);
        getConfigTable(currentEnvironment);
    }

    const releaseConfig = () => {
        setConfigRelease(<ConfigRelease onCallbackEvent={claerConfigRelease} operationType={OperationTypeEnum.add} envId={currentEnvironment.id}></ConfigRelease>)
    }
    const claerConfigRelease = () => {
        setConfigRelease(null);
        getConfigTable(currentEnvironment);
    }


    /**
     * ??????
     * @param id 
     */
    const delConfigClick = (_currentEnvironmentId: any, _configid: string) => {
        currentEnvironment && _environmentService.deleteAppConfiguration(_currentEnvironmentId, _configid).then(p => {
            if (p.success) {
                message.success('????????????');
                getConfigTable(currentEnvironment);
            } else {
                message.error(p.errorMessage, 3);
            }
        })
    }

    const editRow = (_id: any) => {
        setOperationElement(<ConfigOperation onCallbackEvent={() => getConfigTable(currentEnvironment)} operationType={OperationTypeEnum.edit} id={_id} envId={currentEnvironment.id} />)
    }

    return (
        <>
            <Spin spinning={globalLoading}>
                <Layout>
                    <Sider theme="light" className="" >
                        <Card size="small" title="??????????????????" >
                            <Button type="primary" onClick={() => { addChange() }} block>????????????</Button>
                            {
                                listData.map(x => {
                                    return <div>
                                        <Button style={{ marginTop: '10px' }} block onClick={p => getConfigTable(x)}>{x.environmentName}</Button>
                                        {/* <Button type="primary" shape="circle">A</Button> */}
                                    </div>
                                })
                            }
                        </Card>
                        <div style={{ marginTop: '10px' }}>
                            <Card size="small" title="????????????" >
                                <p>???????????????{applicationData?.appId}</p>
                                <p>???????????????{applicationData?.appId}</p>
                                <p>???????????????{applicationData?.chinessName}</p>
                                <p>???????????????{applicationData?.englishName}</p>
                                <p>????????????{applicationData?.linkMan}</p>
                                <p>?????????{applicationData?.status}</p>
                            </Card>
                        </div>
                    </Sider>
                    <Content>
                        <Card title={"???????????????" + currentEnvironment?.environmentName} >
                            <Form layout="inline" name="horizontal_login">
                                <Form.Item name="environmentName">
                                    <Input placeholder="??????key" />
                                </Form.Item>
                                <Button type="primary" htmlType="submit" >??????</Button>
                            </Form>
                        </Card>
                        <Row>
                            <Col span="24" style={{ textAlign: 'right' }}>
                                <Button onClick={() => { backApplicationPage() }} ><LeftOutlined />??????????????????</Button>
                                <Button type="primary" style={{ margin: '8px 8px' }} onClick={() => { addChangeConfig() }}>??????</Button>
                                <Button type="primary" style={{ margin: '8px 8px ' }} onClick={() => { releaseConfig() }}>????????????</Button>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24}>
                                <Table bordered columns={columns} dataSource={tableData} loading={loading} pagination={pagination}  scroll={{ y: 550 }}/>
                                </Col>
                        </Row>
                    </Content>
                    {subOperationElement}
                    {configOperationElement}
                    {configRelease}
                </Layout>
            </Spin>
        </>)
}

export default EnvironmentPage;
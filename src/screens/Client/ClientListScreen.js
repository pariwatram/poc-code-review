import React, { Component } from "react";
import { connect } from "react-redux";
import { R, Storage } from "../../configs";
import {
  FormGroup,
  Label,
  Input,
  Row,
  Col,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Card,
  CardHeader,
  CardBody,
} from "reactstrap";
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";

import Select from "react-select";
import {
  getClientAction,
  deleteClientAction,
} from "../../redux/actions/ClientAction";
import ConfirmDialog from "../../components/ConfirmDialog/ConfirmDialog";
import { toast } from "react-toastify";
import { UserService } from "../../services";

import PanelBox from "../../components/PanelBox/PanelBox.Component";
class ClientListScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      q_clientNo: "",
      q_clientName: "",
      model: {},
      isOpenConfirmDelete: false,
      q_clients: [],
    };

    this.options = {
      sortIndicator: true,
      hideSizePerPage: true,
      paginationSize: 3,
      hidePageListOnlyOnePage: true,
      clearSearch: true,
      alwaysShowAllBtns: false,
      withFirstAndLast: false,
    };

    this.ActionColumnFormatter = this.ActionColumnFormatter.bind(this);
    this.ColumnPackageName = this.ColumnPackageName.bind(this);
    this.ColumnStorageMax = this.ColumnStorageMax.bind(this);
    this.ColumnStorageUse = this.ColumnStorageUse.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.handleClear = this.handleClear.bind(this);
    this.onSaveCompleted = this.onSaveCompleted.bind(this);
    this.showConfirmDelete = this.showConfirmDelete.bind(this);

    this.onConfirmDelete = this.onConfirmDelete.bind(this);
    this.handlerAddClick = this.handlerAddClick.bind(this);
    this.handlerEditClick = this.handlerEditClick.bind(this);
    this.getSizeDisplay = this.getSizeDisplay.bind(this);
  }

  ActionColumnFormatter(cell, row, enumObject, rowIndex) {
    let permission = Storage.getPagePermission();
    let { t } = this.props;
    return (
      <div>
        {permission.enableEdit && (
          <React.Fragment>
            <Button
              color="primary"
              title={t("edit")}
              onClick={() => {
                this.handlerEditClick(row.clientId);
              }}
            >
              <i className={"fa fa-edit"}></i>
            </Button>{" "}
          </React.Fragment>
        )}
        {permission.enableDelete && (
          <React.Fragment>
            <Button
              color="danger"
              title={t("delete")}
              onClick={() => {
                this.showConfirmDelete(row.clientId);
              }}
            >
              <i className="fa fa-trash-o"></i>
            </Button>
          </React.Fragment>
        )}
      </div>
    );
  }

  ColumnPackageName(cell, row, enumObject, rowIndex) {
    let { t } = this.props;
    if (row.packageCode != null) return `${t(row.packageCode)}`;
  }

  ColumnStorageMax(cell, row, enumObject, rowIndex) {
    return this.getSizeDisplay(row.storageMax);
  }

  ColumnStorageUse(cell, row, enumObject, rowIndex) {
    return this.getSizeDisplay(row.storageUsage);
  }

  handleClientChange(e) {
    // let {input} = this.state;
    // input.clientNo = e.value;
    // this.setState({ input: input});
    this.setState({ q_clientNo: e.value });
  }

  onConfirmDelete(props) {
    let { model } = this.state;
    // let {delete_success}=R;

    this.props.deleteClient(model.clientId).then(() => {
      this.setState({ isOpenConfirmDelete: false });
      toast.success(`${R.delete_success}`);
      this.handleSearch();
    });
  }

  handleChange(event) {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  }

  handleClear() {
    this.setState({
      q_clientNo: "",
      q_clientName: "",
    });
  }

  handleSearch() {
    this.props.getClient(this.state.q_clientNo, this.state.q_clientName);
  }

  handlerAddClick() {
    this.props.history.push(`/config/client/create`);
  }

  handlerEditClick(clientId) {
    let { history } = this.props;

    history.push({
      pathname: "/config/client/edit",
      search: `?id=${clientId}`,
    });
  }

  showConfirmDelete(clientId) {
    let { clients } = this.props;

    if (clients && clients.length) {
      const client_filter = clients.filter(
        (u) => `${u.clientId}` === `${clientId}`
      );

      if (client_filter && client_filter.length > 0) {
        this.setState({
          isOpenConfirmDelete: true,
          model: client_filter[0],
        });
      }
    }
  }

  onSaveCompleted() {
    this.handleSearch();
  }

  getSizeDisplay(fileSize) {
    fileSize = Number(fileSize);
    let sizeDisplay = "";
    if (fileSize > 0) {
      let fileSizeAdj = fileSize / 1;
      sizeDisplay = `${fileSizeAdj.toFixed(2)} MB`;

      if (fileSizeAdj > 1024) {
        fileSizeAdj = fileSizeAdj / 1024;
        sizeDisplay = `${fileSizeAdj.toFixed(2)} GB`;
      }
    }
    return sizeDisplay;
  }

  componentDidMount() {
    this.props.getClient(null, null);
    let user = Storage.getUser();
    let promise = UserService.getUserClient(user.userId, null);

    promise.then((response) => {
      let datas = [];
      response.data.map(({ clientNo, clientName }) => {
        datas.push({ label: clientNo + " - " + clientName, value: clientNo });
      });

      let input = {};
      input.clientNo = user.clientNo;
      this.setState({ q_clients: datas, input: input });
    });
  }

  render() {
    const { q_clientNo, q_clientName, isOpenConfirmDelete, q_clients } =
      this.state;
    const { clients, t } = this.props;
    let permission = Storage.getPagePermission();
    return (
      <div className="animated">
        <PanelBox icon="icon-menu" title={t("search_client")}>
          <CardBody>
            <FormGroup>
              <Row>
                <Col xs="3" className="text-right">
                  <Label htmlFor="q_clientNo">{t("client_no")}</Label>
                </Col>
                <Col xs="6">
                  <FormGroup>
                    {/* <Input
                    type="text"
                    name="q_clientNo"
                    onChange={this.handleChange}
                    value={q_clientNo}
                  /> */}
                    <Select
                      name="q_clientNo"
                      value={q_clients.find((e) => e.value === q_clientNo)}
                      //defaultValue={clientNo}
                      onChange={(e) => {
                        this.handleClientChange(e);
                      }}
                      options={q_clients}
                    />
                  </FormGroup>
                </Col>
                {/* <Col xs="3" className="text-right">
                <Label htmlFor="q_clientName">{t('client_name')}</Label>
              </Col>
              <Col xs="3">
                <FormGroup>
                  <Input
                    type="text"
                    name="q_clientName"
                    onChange={this.handleChange}
                    value={q_clientName}
                  />
                </FormGroup>
              </Col> */}
              </Row>
              <Row>
                <Col xs="12" className="text-center">
                  <Button color="success" onClick={this.handleSearch}>
                    <i className="fa fa-search"></i>
                    {"\u00A0"} {t("apply_filter", R.search)}
                  </Button>{" "}
                  <Button color="secondary" onClick={this.handleClear}>
                    <i className="fa fa-repeat"></i>
                    {"\u00A0"} {t("clear_all_fields", R.clear)}
                  </Button>
                </Col>
              </Row>
            </FormGroup>
          </CardBody>
        </PanelBox>

        <Card>
          <CardBody>
            <Row
              style={{ display: permission.enableAdd == false ? "none" : "" }}
            >
              <Col xs="12">
                <FormGroup>
                  <Button color="success" onClick={this.handlerAddClick}>
                    <i className="fa fa-plus"></i>
                    {"\u00A0"} {t("create_new_client", R.add)}
                  </Button>
                </FormGroup>
              </Col>
            </Row>
            <BootstrapTable
              data={clients}
              options={{ hideSizePerPage: true }}
              version="4"
              striped
              hover
              pagination
            >
              <TableHeaderColumn isKey={true} dataField="clientId" hidden>
                ID
              </TableHeaderColumn>
              <TableHeaderColumn dataField="clientId" dataSort>
                {t("client_id")}
              </TableHeaderColumn>
              <TableHeaderColumn dataField="clientNo" dataSort>
                {t("client_no")}
              </TableHeaderColumn>
              <TableHeaderColumn dataField="clientName" dataSort>
                {t("client_name")}
              </TableHeaderColumn>

              {/* <TableHeaderColumn
                dataField="packageCode"
                // dataFormat={this.ColumnPackageName} 
              
              > */}
              <TableHeaderColumn
                dataSort
                columnTitle
                tdStyle={{ whiteSpace: "normal" }}
                dataFormat={this.ColumnPackageName}
              >
                {t("package_name")}
              </TableHeaderColumn>
              <TableHeaderColumn dataFormat={this.ColumnStorageMax} dataSort>
                {t("storage_max")}
              </TableHeaderColumn>
              <TableHeaderColumn dataFormat={this.ColumnStorageUse} dataSort>
                {t("storage_usage")}
              </TableHeaderColumn>

              <TableHeaderColumn dataField="clientAddress1" dataSort>
                {t("client_address_1")}
              </TableHeaderColumn>
              {/* <TableHeaderColumn dataField="clientAddress2" dataSort>
                {t("client_address_2")}
              </TableHeaderColumn> */}
              <TableHeaderColumn dataField="clientTel" dataSort>
                {t("client_contact_no")}
              </TableHeaderColumn>
              <TableHeaderColumn
                dataAlign="center"
                dataFormat={this.ActionColumnFormatter}
                tdStyle={{ verticalAlign: "middle" }}
              >
                {t("operations")}
              </TableHeaderColumn>
            </BootstrapTable>
          </CardBody>
        </Card>

        <ConfirmDialog
          isOpen={isOpenConfirmDelete}
          title={t("confirm", "Confirm")}
          text={t("are_you_confirm_to_delete", "Do you want confirm this")}
          onOKClicked={this.onConfirmDelete}
          onCancelClicked={() => this.setState({ isOpenConfirmDelete: false })}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  const { ClientRedux, TranslateRedux } = state;
  const { t, current_language } = TranslateRedux;
  return {
    clients: ClientRedux.clients,
    t,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    getClient: (clientNo, clientName) =>
      dispatch(getClientAction(clientNo, clientName)),
    deleteClient: (clientId) => dispatch(deleteClientAction(clientId)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ClientListScreen);

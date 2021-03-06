import React, { Component } from "react";
import {
  Container,
  Col,
  Row,
  Form,
  FormGroup,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter
} from "reactstrap";
import { Heading, Field, Input, Textarea, Select, Button } from "rimble-ui";
import { withRouter } from "react-router";

class NewSplitter extends Component {
  constructor(props) {
    super(props);
    const { drizzle, drizzleState } = this.props;
    this.state = {
      name: "",
      percentage: "",
      address: "",
      account: drizzleState.accounts[0],
      modal: false,
      transactionHash: "",
      modalSuccess: true,
      modalPending: true,
      modalBody: "",
      modalTitle: ""
    };
    this.web3 = drizzle.web3;
    this.onChangeName = this.onChangeName.bind(this);
    this.onChangePercentage = this.onChangePercentage.bind(this);
    this.onChangeAddress = this.onChangeAddress.bind(this);
    this.onSubmitForm = this.onSubmitForm.bind(this);
    this.toggle = this.toggle.bind(this);
  }

  toggle() {
    this.setState({
      modal: !this.state.modal
    });
  }

  onChangeName(event) {
    this.setState({ name: event.target.value });
  }

  onChangePercentage(event) {
    this.setState({ percentage: event.target.value });
  }

  onChangeAddress(event) {
    this.setState({ address: event.target.value });
  }

  componentDidMount() {
    const { drizzle } = this.props;
    // subscribe to changes in the store
    this.unsubscribe = drizzle.store.subscribe(() => {
      // every time the store updates, grab the state from drizzle
      const drizzleState = drizzle.store.getState();

      // check to see if it's ready, if so, update local component state
      if (drizzleState.drizzleStatus.initialized) {
        if (drizzleState.transactionStack[this.state.transactionId]) {
          const transactionHash =
            drizzleState.transactionStack[this.state.transactionId];
          if (
            drizzleState.transactions[transactionHash].status == "pending" &&
            this.state.modalPending
          ) {
            this.setState({
              transactionHash: transactionHash,
              modal: true,
              modalTitle: "Transaction Submited!",
              modalBody: "Wait for confirmation",
              modalPending: false,
              name: "",
              address: "",
              percentage: ""
            });
          }
          if (
            drizzleState.transactions[transactionHash].status == "success" &&
            this.state.modalSuccess
          ) {
            this.setState({
              transactionHash: transactionHash,
              modal: true,
              modalTitle: "Success!",
              modalBody: `The information was saved in the blockchain with the confirmation hash: ${
                this.state.transactionHash
              }`,
              modalSuccess: false
            });
          }
        }
      }
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  async onSubmitForm(event) {
    event.preventDefault();
    const stackId = await this.props.drizzle.contracts.SplitterFactory.methods.createSplitter.cacheSend(
      this.state.address,
      this.state.percentage,
      this.web3.utils.utf8ToHex(this.state.name),
      { from: this.props.drizzleState.account }
    );
    this.setState({ transactionId: stackId });
  }

  render() {
    return (
      <>
        <Modal
          isOpen={this.state.modal}
          toggle={this.toggle}
          size="lg"
          className={this.props.className}
        >
          <ModalHeader toggle={this.toggle}>
            {this.state.modalTitle}
          </ModalHeader>
          <ModalBody>{this.state.modalBody}</ModalBody>
          <ModalFooter>
            <Button onClick={this.toggle}>Close</Button>
          </ModalFooter>
        </Modal>
        <Container className="mt-4">
          <Row className="justify-content-center mt-4">
            <Col lg="6 mt-4">
              <Heading.h2>Create Splitter</Heading.h2>
              <Form className="form" onSubmit={this.onSubmitForm}>
                <FormGroup>
                  <Field label="Splitter Name">
                    <Input
                      name="name"
                      value={this.state.name}
                      onChange={this.onChangeName}
                      fullWidth
                      className="form-control"
                    />
                  </Field>
                </FormGroup>
                <FormGroup>
                  <Field label="Main Actor Address">
                    <Input
                      name="address"
                      value={this.state.address}
                      onChange={this.onChangeAddress}
                      fullWidth
                      className="form-control"
                    />
                  </Field>
                </FormGroup>
                <FormGroup>
                  <Field label="Tip Percentage Split" className="">
                    <Input
                      name="percentage"
                      value={this.state.percentage}
                      onChange={this.onChangePercentage}
                      fullWidth
                      className="form-control"
                    />
                  </Field>
                </FormGroup>
                <Button type="submit">Create Splitter</Button>
              </Form>
            </Col>
          </Row>
        </Container>
      </>
    );
  }
}

export default withRouter(NewSplitter);

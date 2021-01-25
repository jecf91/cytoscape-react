import React, { Component } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import { stylesheet } from "./stylesheet";

const setClass = val => {
  if (val.is_client) {
    return "is_client";
  } else if (val.is_client_attribute) {
    return "is_client_attribute";
  } else if (val.is_product) {
    return "is_product";
  } else {
    return "is_product_attribute";
  }
};

const layout = {
  name: "circle",
};

const nodesMaped = nodes =>
  nodes.map(node => ({
    data: { id: node.id, label: node.name },
    position: { x: Math.random(1) * 490, y: Math.random(1) * 490 },
    classes: setClass(node),
  }));

const edgesMap = (nodes, user) =>
  nodes.map(node => ({
    data: { source: user.id, target: node.id },
  }));

const userMap = user => [
  {
    data: { id: user.id, label: user.name },
    position: { x: 250, y: 250 },
    classes: setClass(user),
  },
];

class App extends Component {
  state = {
    clientName: "",
    elements: [],
  };

  componentDidMount() {
    this.getUserData("Victor Rollman");
  }

  getUserData = async userName => {
    const userResponse = await fetch(
      `http://0.0.0.0:5000/entities?name=${encodeURIComponent(userName)}`
    );
    const userResponseJSON = await userResponse.json();
    const user = userMap(userResponseJSON[0]);
    const userFacts = await this.getFactsFromUser(userResponseJSON[0].id);
    const entitiesIds = userFacts.map(facts => facts.tail_entity_id);
    const nodesArr = await this.getNodesData(entitiesIds);
    const nodes = nodesMaped(nodesArr);
    const edges = edgesMap(nodesArr, user[0].data);
    const elements = [...user, ...nodes, ...edges];
    this.setState({ elements });
  };

  getFactsFromUser = async userId => {
    const response = await fetch(
      `http://0.0.0.0:5000/facts?head_entity_id=${userId}`
    );
    const responseJSON = await response.json();
    return responseJSON;
  };

  getNodesData = async entitiesIds => {
    const response = await fetch(
      `http://0.0.0.0:5000/entities?id=[${entitiesIds}]`
    );
    const responseJSON = await response.json();
    return responseJSON;
  };

  render() {
    return (
      <>
        <input
          type="text"
          value={this.state.clientName}
          onChange={e => this.setState({ clientName: e.target.value })}
        />
        <button onClick={() => this.getUserData(this.state.clientName)}>
          add name
        </button>
        <CytoscapeComponent
          panningEnabled={false}
          elements={this.state.elements}
          stylesheet={stylesheet}
          layout={layout}
          style={{ width: "550px", height: "550px", border: "2px solid blue" }}
        />
      </>
    );
  }
}

export default App;

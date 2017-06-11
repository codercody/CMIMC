class Hello extends React.Component {
  constructor() {
    super()
  }

  render() {
    var hello = "Konnichiha"
    return (
      <div>
        <h3>Japanese</h3>
        <p>{hello}</p>
      </div>
    )
  }
}

ReactDOM.render(
  (
    <Hello />
  ),
  document.getElementById('hello')
);

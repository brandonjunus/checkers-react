import React, { Component } from 'react';
import styled from 'styled-components'

const salmonRed = '#FFA07A'
const dimGrey = '#696969'

const Wrapper = styled.div`
`

const Board = styled.div`
  border: solid 5px goldenrod;
  display: grid;
  grid-template-columns: repeat(8, 100px);
  justify-content: center;
`

const Cell = styled.div`
  border: solid;
  height: 100px;
  width: 100px;
  background-color: ${props => props.color};
`

class App extends Component {
  constructor(props){
    super(props)
    this.state = {
      board: [
        ['___', 'RED', '___', 'RED', '___', 'RED', '___', 'RED'],
      ['RED', '___', 'RED', '___', 'RED', '___', 'RED', '___'],
      ['___', 'RED', '___', 'RED', '___', 'RED', '___', 'RED'],
      ['___', '___', '___', '___', '___', '___', '___', '___'],
      ['___', '___', '___', '___', '___', '___', '___', '___'],
      ['BLACK', '___', 'BLACK', '___', 'BLACK', '___', 'BLACK', '___'],
      ['___', 'BLACK', '___', 'BLACK', '___', 'BLACK', '___', 'BLACK'],
      ['BLACK', '___', 'BLACK', '___', 'BLACK', '___', 'BLACK', '___'],
    ],
    previousSelection: [],
    previousPossibleMoves: [],
    previousMovesString: '',
    currentTurn: 'BLACK',
    inDoubleJump: false,
  }
  
  this.move = this.move.bind(this);
  }
  
  validateMove(coordinates, jumpMove = false, rowi, coli){
    const { board, currentTurn } = this.state;
    
    if (!jumpMove){
      return coordinates[0] < board.length && 
              coordinates[0] >= 0 && 
              coordinates[1] < board.length &&
              coordinates[1] >= 0 &&
              board[coordinates[0]][coordinates[1]] !== 'RED' &&
              board[coordinates[0]][coordinates[1]] !== 'BLACK';
            } else {
              return coordinates[0] < board.length && 
              coordinates[0] >= 0 && 
              coordinates[1] < board.length &&
              coordinates[1] >= 0 &&
              board[coordinates[0]][coordinates[1]] !== 'RED' &&
              board[coordinates[0]][coordinates[1]] !== 'BLACK' &&
              board[(coordinates[0] + rowi) / 2][(coordinates[1] + coli) / 2] === (currentTurn === 'RED' ? 'BLACK' : 'RED');
            }
          }

          changeTurn(){
            const { currentTurn, inDoubleJump } = this.state;
            this.setState({
              inDoubleJump: !inDoubleJump,
              currentTurn: currentTurn === 'RED' ? 'BLACK' : 'RED'
            }) 
  }
  
  move(rowi, coli) {
    const { board, previousPossibleMoves, currentTurn, previousSelection, previousMovesString } = this.state;
    let currentSelection;
    let possibleMoves = [];
    // clear previous possible moves
    previousPossibleMoves.forEach(move => {
      board[move[0]][move[1]] = '___'
    })
    
    // if current move is possibleMove, move previous selection to current selection
    if (previousMovesString.includes(JSON.stringify([rowi,coli]))) {
      
      // if the current row you are trying to move to is two steps away from the previous step, it means youre trying to do a jump move
      if (Math.abs(previousSelection[0] - rowi) > 1){
        board[(previousSelection[0] + rowi) / 2][(previousSelection[1] + coli)/ 2] = '___'
        if (currentTurn === 'RED') {
          // make possible moves for jumped down left and down right
          let downRightJump = [rowi + 2, coli + 2];
          let downLeftJump = [rowi + 2, coli - 2];
          if (this.validateMove(downRightJump, true, rowi, coli)) possibleMoves.push(downRightJump);
          if (this.validateMove(downLeftJump, true, rowi, coli)) possibleMoves.push(downLeftJump);
        } else if (currentTurn === 'BLACK') {
          // make possible moves for jumped up left and up right
          let upRightJump = [rowi - 2, coli + 2];
          let upLeftJump = [rowi - 2, coli - 2];
          if (this.validateMove(upRightJump, true, rowi, coli)) possibleMoves.push(upRightJump);
          if (this.validateMove(upLeftJump, true, rowi, coli)) possibleMoves.push(upLeftJump);
        } 
      }
      board[previousSelection[0]][previousSelection[1]] = '___';
      board[rowi][coli] = currentTurn;
      // if you can't jump any other things, change turn. 
      if (!possibleMoves.length) this.changeTurn();

      // else, show the possible moves made from this click
    } else {
      if (board[rowi][coli] === 'RED' && currentTurn === 'RED'){
        // make possible moves for immediate down left and down right
        let downRight = [rowi + 1, coli + 1];
        let downLeft = [rowi + 1, coli - 1];
        if (this.validateMove(downRight)) possibleMoves.push(downRight);
        if (this.validateMove(downLeft)) possibleMoves.push(downLeft);
        
        // make possible moves for jumped down left and down right
        let downRightJump = [rowi + 2, coli + 2];
        let downLeftJump = [rowi + 2, coli - 2];
        if (this.validateMove(downRightJump, true, rowi, coli)) possibleMoves.push(downRightJump);
        if (this.validateMove(downLeftJump, true, rowi, coli)) possibleMoves.push(downLeftJump);
        
      } else if (board[rowi][coli] === 'BLACK' && currentTurn === 'BLACK'){
        // make possible moves for immediate up left and up right
        let downRight = [rowi - 1, coli + 1];
        let downLeft = [rowi - 1, coli - 1];
        if (this.validateMove(downRight)) possibleMoves.push(downRight);
        if (this.validateMove(downLeft)) possibleMoves.push(downLeft);
        
        // make possible moves for jumped up left and up right
        let upRightJump = [rowi - 2, coli + 2];
        let upLeftJump = [rowi - 2, coli - 2];
        if (this.validateMove(upRightJump, true, rowi, coli)) possibleMoves.push(upRightJump);
        if (this.validateMove(upLeftJump, true, rowi, coli)) possibleMoves.push(upLeftJump);
      }
    }
    currentSelection = [rowi,coli];
    possibleMoves.forEach(move => {
      board[move[0]][move[1]] = 'POSSIBLE_MOVE';
    })

    this.setState({
      board,
      previousSelection: currentSelection,
      previousPossibleMoves: possibleMoves,
      // need to stringify the possible moves to see if it is included in the next possible move
      previousMovesString: JSON.stringify(possibleMoves)
    }, () => console.log(this.state));
    
  }
  
  handleClick(e, rowi, coli){
    this.move(rowi, coli);
  }

  render() {
    const { board, currentTurn } = this.state;
    return (
      <Wrapper>
        <h1>Current Turn: {currentTurn}</h1>
        <Board className="App">
          {board.map((row, rowi) => 
            row.map((col, coli) => 
                <Cell 
                key={coli}
                onClick={(e) => this.handleClick(e, rowi, coli)}
                color={board[rowi][coli] === 'RED' ? salmonRed :
                  board[rowi][coli] === 'BLACK' ? dimGrey : 
                  board[rowi][coli] === 'POSSIBLE_MOVE' ? 'RED' :
                  'WHITE'
                }
                >{col}</Cell>
              )
            )}
        </Board>
      </Wrapper>
    );
  }
}

export default App;

// flexbox styles
// const Board = styled.div`
//   border: solid goldenrod 10px;
//   /* display: flex; */
//   min-height: calc(100vh - 20px);
//   /* justify-content: center; */
//   /* align-items: center; */
//   margin: auto;
// `

// const Cell = styled.div`
//   width: 100px;
//   height: 100px;
//   border: solid;
//   background-color: ${props => props.color};
//   /* display: inline-flex; */
// `

// const Cell = styled.div`
//   width: 100px;
//   height: 100px;
//   border: solid;
//   /* display: inline-flex; */
// `

// const Row = styled.div`
//   display: flex;
//   /* min-width: 850px; */
// `
// board with flexbox
// {board.map((row, rowi) => (
//   <Row key={rowi}>
//     {row.map((col, coli) => (
//       <Cell 
//       key={coli}
//       onClick={(e) => this.handleClick(e, rowi, coli)}
//       color={board[rowi][coli] === 'RED' ? salmonRed :
//         board[rowi][coli] === 'BLACK' ? dimGrey : 
//         board[rowi][coli] === 'POSSIBLE_MOVE' ? 'RED' :
//         'WHITE'
//       }
//       >{col}</Cell>
//     ))}
//   </Row>
// ))}
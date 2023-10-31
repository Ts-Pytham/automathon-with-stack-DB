const symbolSpan = document.getElementById('symbol-checking')
const symbolOrderSpan = document.getElementById('symbol-checking-number')

class PDA {
  constructor(transitions) {
    this.stack = ["#"];
    this.currentState = 'q0';
    this.inputlength=0; 
    this.transitions= transitions
  }
}
const transitions = {
  q0: {
    'a': [
      { key: 'T2' ,nextState: 'q1', pop: "a" },
      { key: 'T1' ,nextState: 'q0', pop: "#", push: '#a' },
      { key: 'T1' ,nextState: 'q0', pop: "a", push: 'aa' },
      { key: 'T1' ,nextState: 'q0', pop: "b", push: 'ba' },
    ],
    'b': [
      { key: 'T2' ,nextState: 'q1', pop: "b" },
      { key: 'T1' ,nextState: 'q0', pop: "#", push: '#b' },
      { key: 'T1' ,nextState: 'q0', pop: "a", push: 'ab' },
      { key: 'T1' ,nextState: 'q0', pop: "b", push: 'bb' },
    ]
  },
  q1: {
    'a': [{ key: 'T3' ,nextState: 'q1', pop: 'a' }],
    'b': [{ key: 'T3' ,nextState: 'q1', pop: 'b' }],
    ' ': [{ key: 'T4' ,nextState: 'q2', pop: '#', push: '#' }]
  },
  q2: {}
};

const pda = new PDA(transitions);

async function wordChecking(symbolToCheck, symbolOrder){
  symbolSpan.innerText = symbolToCheck;
  symbolOrderSpan.innerText = symbolOrder;
  await sleep(get_speed())
  console.log(pda.transitions)
  const stateTransitions = pda.transitions[pda.currentState][symbolToCheck];
  if (!stateTransitions) {
      return false
  }
  let validTransition = findValidTransition(stateTransitions)
  var keyNodeTransiction=highlightLinkBetweenNodes(pda.currentState,validTransition.nextState)
  console.log(keyNodeTransiction)
  if (!validTransition) {
      return false;
  }

  await applyTransition(validTransition, keyNodeTransiction)
  await sleep(get_speed()) 
  pda.currentState = validTransition.nextState;
  showCurrentNodeGraph(pda.currentState)
}

function findValidTransition(stateTransitions){
  let  validTransition=null;
  for (const transition of stateTransitions) {
      if (!transition.pop || transition.pop === pda.stack[pda.stack.length - 1]) {
          if(!transition.push){
              if(pda.stack.length > pda.inputlength/2){
                validTransition = transition;
                break
              }
          }
        validTransition= transition;
      }
  }
  return validTransition;
}

async function applyTransition(transition, keyNodeTransiction) {
  pda.currentState = transition.nextState;
  showCurrentNodeGraph(keyNodeTransiction)
  await sleep(get_speed())
  if (transition.pop) {
      popFromStack(transition.pop);
      await sleep(get_speed())
  }
  if (transition.push) {
      await pushToStack(transition.push);
      await sleep(get_speed())
  }
}

async function popFromStack(symbol) {
  const popped = pda.stack.pop();
  if (popped !== symbol) {
      return false;
  }
  deleteItemIntoStack(pda.stack)
}

async function pushToStack(symbols) {
  pushCharacters = symbols.split('');
  pushCharacters.forEach( async char => {
      pda.stack.push(char);
      await createStack(char);
  });
}

async function accept(input) {
  pda.inputlength = input.length;
  reset();
  await sleep(get_speed())
  console.log(pda.currentState)
  let symbolOrder = 1;
  for (const symbol of input) {
    await wordChecking(symbol, symbolOrder);
    symbolOrder = symbolOrder+1;
  }
  console.log(pda.stack.length)
  return pda.currentState === 'q2' && pda.stack.length === 1;
}

function reset() {
  pda.currentState = 'q0';
  showCurrentNodeGraph(pda.currentState)
  pda.stack = ["#"];
  deleteItemIntoStack(pda.stack)
}
//************************************************************************************************************************************************* */
function createStackItem(symbolPush){
  const item = document.createElement('div');
  item.id = 'stack-item'; 
  item.textContent = symbolPush;
  return item;
}

function insertItemIntoStack(paragraph){
  const container = document.getElementById('stack');
  container.appendChild(paragraph);
}

async function createStack(symbolPush){
  var stackItem = createStackItem(symbolPush);
  insertItemIntoStack(stackItem)
  await sleep(get_speed())
}

function deleteItemIntoStack(stack){
  const container = document.getElementById('stack');
  container.innerHTML = "";
  for(const item of stack){
      createStack(item)
  }
}
//*************************************************************************************************************************************************************************** */

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

//**************************************************************************************************************************************************************** */
function createHistoryTileItem(userWord){
    const newParagraph = document.createElement('p');
    newParagraph.classList.add('historial-tile'); 
    newParagraph.textContent = userWord;
    return newParagraph;
}

function createHistoryTileSpan(isValidate){
    const newSpan = document.createElement('span');
    if(isValidate){
        newSpan.classList.add('w-validated');
        newSpan.textContent = 'V'
    }else{
        newSpan.classList.add('w-rejected');
        newSpan.textContent = 'R'
    };
    return newSpan;
}

function insertSpanInParagraph(paragraph, span){
    paragraph.appendChild(span);
}

function insertParagraphIntoDOM(paragraph){
    const container = document.getElementById('historial-list');
    container.appendChild(paragraph);
}

function createHistoryTile(userWord, isValidate){
    var historyTile = createHistoryTileItem(userWord);
    var historyTileSpan = createHistoryTileSpan(isValidate);
    insertSpanInParagraph(historyTile,historyTileSpan);
    insertParagraphIntoDOM(historyTile)
    
  
    saveToDatabase(userWord, isValidate);
}

function researchHistoryTile(userWord, isValidate){
  var historyTile = createHistoryTileItem(userWord);
  var historyTileSpan = createHistoryTileSpan(isValidate);
  insertSpanInParagraph(historyTile,historyTileSpan);
  insertParagraphIntoDOM(historyTile)
  
}
const url = 'automathon-database-python.azurewebsites.net'
function saveToDatabase(userWord, isValidate) {
  fetch(`${url}/guardar_historial`, {
      method: 'POST',
      body: new URLSearchParams({ userWord, isValidate }),
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      }
  });
}

async function retrieveHistoryData() {
  const response = await fetch(`${url}/obtener_historial`);
  const historial = await response.json();
  console.log(historial)
  return historial ;
}


function displayHistoryData(historyData) {
  console.log(historyData);
  for (const item of historyData) {
    const userWord = item[0];
    const isValidate = item[1];
    console.log(userWord, isValidate);
    researchHistoryTile(userWord, JSON.parse(isValidate));
  }
}


 async function initializePage() {
  const historyData =  await retrieveHistoryData();
  console.log(historyData) // Await the data
  displayHistoryData(historyData);
}

window.addEventListener('load', initializePage);

const $ = go.GraphObject.make;

const myDiagram = $(go.Diagram, "myDiagram", {
    initialContentAlignment: go.Spot.Center,
    "undoManager.isEnabled": true
});

myDiagram.nodeTemplate =
    $(go.Node, "Auto",
        {movable: false},
        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
        $(go.Shape, "Circle", 
            { width: 30, height: 30, strokeWidth: 2 },
            {  fill:  "white" },
            new go.Binding("stroke", "color"),
            new go.Binding("fill", "isSelected", (s, obj) => s ? "#BEAEE2" : "white").ofObject()
            ),
        $(go.TextBlock, 
            { margin: 10 },  
            new go.Binding("text", "name")  
        )
    );

    myDiagram.model.addNodeData({ key: "_",  name: "" , color: "transparent", loc: "-1100 -10" });
    myDiagram.model.addNodeData({ key: "q0",  name: "q0" , color: "purple", loc: "-1030 -10" });
    myDiagram.model.addNodeData({ key: "q1",  name: "q1" , color: "purple",   loc: "-960 -10"  });
    myDiagram.model.addNodeData({ key: "q2",  name: "q2" , color: "red", loc: "-890 -10"  });
    
    myDiagram.model.addNodeData({ key: "T2", color:"transparent", loc: "-995 -10"  });
    myDiagram.model.addNodeData({ key: "T4", color:"transparent", loc: "-925 -10"  });
    myDiagram.model.addNodeData({ key: "T1", color:"transparent", loc: "-1030 25"  });
    myDiagram.model.addNodeData({ key: "T3", color:"transparent", loc: "-960 25"  });
    
myDiagram.linkTemplate =
    $(go.Link,
        $(go.Shape, { 
        stroke: "gray"},
        new go.Binding("stroke", "isHighlighted", fla => fla ? "red" : "gray")
    ),
        $(go.Shape, { toArrow: "Standard" }),
        $(go.Panel, "Auto",  
            
          $(go.TextBlock, "",  // the label text
            {
              textAlign: "center",
              font: "10pt helvetica, arial, sans-serif",
              stroke: "black",
              margin: 4, 
            },
            new go.Binding("text", "text").makeTwoWay()),
          new go.Binding("segmentOffset", "segmentOffset", go.Point.parse).makeTwoWay(go.Point.stringify)
        )
            
    );

myDiagram.model.addLinkData({ from: "_",  to: "q0"  });
myDiagram.model.addLinkData({ from: "q0",  to: "q0"  , text: "\n\n\n\n\n\nb, b/bb\na, b/ba\nb, a/ab\na, a/aa\nb, #/#b\na, #/#a ", key:"T1"});
myDiagram.model.addLinkData({ from: "q0",  to: "q1"  , text: "b, b/λ\na,a/λ\n\n\n", key:"T2"});
myDiagram.model.addLinkData({ from: "q1",  to: "q1"  , text: "\n\nb, b/λ\na,a/λ", key:"T3"});
myDiagram.model.addLinkData({ from: "q1",  to: "q2"  , text: "λ, #/#\n\n", key:"T4"});
    
    
async function showCurrentNodeGraph(key) {
    const currentNode = myDiagram.findNodeForKey(key);
    selectNode(currentNode);
    await sleep(1000);
    deselectNode(currentNode);
  }
  
  function selectNode(node) {
    node.isSelected = true;
  }
  
  function deselectNode(node) {
    node.isSelected = false;
  }


function highlightLinkBetweenNodes(startNodeKey, endNodeKey) {
    const linkDataArray = myDiagram.model.linkDataArray;
    for (let i = 0; i < linkDataArray.length; i++) {
      const linkData = linkDataArray[i];
      console.log(linkData)
      if (linkData.from === startNodeKey && linkData.to === endNodeKey) {
        return linkData.key; 
      }
    }
  }
/************************************************************************************************************************************************************************** */
const selectLanguageDom = document.getElementById('languanges-select')

selectLanguageDom.addEventListener('change', handleLanguageChange )

function handleLanguageChange(){
    var selectedLanguage = selectLanguageDom.value;
    changeLanguage(selectedLanguage);
}

function get_speed(){
    const slider = document.getElementById("slider");
    const tiempoSeleccionado = parseFloat(slider.value) * 1000; 
    return tiempoSeleccionado;
}

document.addEventListener("DOMContentLoaded", function() {
    changeLanguage('en');
    var botton = document.getElementById("word-button");
    var input = document.getElementById("word-text");
    deleteItemIntoStack(pda.stack)


    botton.addEventListener("click", handleButtonClick);

    function handleButtonClick() {
        const valorInput = input.value;
        displayExpression(valorInput);
        clearInput();
        processString(valorInput);
      }
      
    function displayExpression(expression) {
        const expressionElement = document.getElementById('word-checking');
        expressionElement.innerText = expression;
      }
      
    function clearInput() {
        input.value = '';
      }

      async function processString(wordToValidate) { 
        const isAccepted = await accept(wordToValidate+" ")
        if (!isAccepted) {
            speakResult(false);
            createHistoryTile(wordToValidate, false);
            return;
         }
      
         showCurrentNodeGraph(pda.currentState)
         speakResult(isAccepted);
         createHistoryTile(wordToValidate, isAccepted);   
    }
      
});

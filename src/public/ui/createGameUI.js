/*

Create Game UI
==============
Description:
Intended to produce elements no the DOM for both viewing and controlling the game.

Use:
Elements created by this method accessed by their IDs

*/

// Create elements on DOM
function createGameUI(listOfPlayerActions, onPlayerSelectsAction, onEndTurn, numberOfColumns = 12){
    
    // Create container
    var container = createEle('DIV', on=document.body);
        container.className = 'p-5 d-flex flex-column';

    // Create title
    var title = createEle('H1', on=container);
        title.innerHTML = 'Pandemic simulator';    

    // Create SVGs for graphs
    var casesGraph_title = createEle('H5', on=container);
        casesGraph_title.innerHTML = 'COVID-19 cases';
        casesGraph_title.className = 'p-2';
    var casesGraph = createSVG(on=container, 'cases-graph');

    
    var costGraph_title = createEle('H5', on=container);
        costGraph_title.innerHTML = 'Cost per day';
        costGraph_title.className = 'p-2';
    var costGraph = createSVG(on=container, 'cases-graph');

    // Create row
    var row_title = createEle('H5', on=container);
        row_title.innerHTML = 'Lockdown policies';
        row_title.className = 'p-2';
    var row = createEle('DIV', on=container);
        row.className = 'row';

    // Create n columns in grid
    for(i=0; i<numberOfColumns; i++){

        // Create a column
        var col = createEle('DIV', on=row);
            col.className = `col-${numberOfColumns/12}`;

        // Give date heading
        var date = createEle('P', on=col);
            date.innerHTML = `${i+1}/20`;
            date.style.textAlign = 'center';

        // Fill the column with UI

            // Player action buttons for each action players can make
            for(const action of listOfPlayerActions){

                // Make an action button
                var btn = createEle('BUTTON', on=col, id=`turn${i}-${action.id}`);
                    btn.className = `player-action m-2 btn btn-sm`;
                    btn.style.height = 'auto';
                    btn.style.width = '100%';
                    btn.setAttribute('data-action', action.id);
                    btn.style.position = 'relative';
                    btn.innerHTML = `${action.icon} <br> <span style='font-size: 0.75rem;'>${action.name}</span>`;
                    btn.onclick = function(){
                        
                        // Style as active/inactive
                        $(this).toggleClass('btn-light');
                        $(this).toggleClass('btn-success');

                        // On player selects action pass action to event
                        onPlayerSelectsAction($(this).attr('data-action'));
                    };

            }
    }

    // End turn button
    var endTurnBtn = createEle('BUTTON', on=container, id=`end-turn`);
        endTurnBtn.className = `w-100 m-2 btn btn-lg btn-secondary`;
        endTurnBtn.innerHTML = `Click to simulate policy for the month <i class="fas fa-arrow-right"></i>`
        endTurnBtn.onclick = function(){

            // Call back to event on player making action
            onEndTurn();
        }
}

/* 
Shorthand functions to create DOM elements

    Arguments
    --------
    type = HTML tag of element to create (string)
    parentEle = parent to append element to (HTML element)
    id = id to give element, optional (string)
*/

function createEle(type, parentEle, id=null){

    var ele = document.createElement(type)
        id ? ele.id = id : null; // Give ID if specified
    parentEle.appendChild(ele);

    return ele

}

function createSVG(parentEle, id){
    
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute('style', 'border: 0.5px solid #eee; border-radius: 5px');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100');
        svg.setAttribute('id', id);
        svg.setAttribute('class', 'm-2');
    parentEle.appendChild(svg);

    return svg
}
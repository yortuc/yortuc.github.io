export default function startSwipeGestures(swipeCallback){
    document.addEventListener('touchstart', handleTouchStart,  { passive: false });        
    document.addEventListener('touchmove', handleTouchMove,  { passive: false });

    var xDown = null;                                                        
    var yDown = null;

    function getTouches(evt) {
        return evt.touches ||             // browser API
                evt.originalEvent.touches; // jQuery
    }                                   

    function handleTouchStart(evt) {
        const firstTouch = getTouches(evt)[0];                                      
        xDown = firstTouch.clientX;                                      
        yDown = firstTouch.clientY;
        evt.preventDefault();                  
    };

    function handleTouchMove(evt) {
        if ( ! xDown || ! yDown ) {
            return;
        }

        var xUp = evt.touches[0].clientX;                                    
        var yUp = evt.touches[0].clientY;

        var xDiff = xDown - xUp;
        var yDiff = yDown - yUp;

        if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/
            if ( xDiff > 0 ) {
                /* left swipe */ 
                swipeCallback['left']()
            } else {
                /* right swipe */
                swipeCallback['right']()
            }                       
        } else {
            if ( yDiff > 0 ) {
                /* up swipe */ 
                swipeCallback['up']()
            } else { 
                /* down swipe */
                swipeCallback['down']()
            }                                                                 
        }
        /* reset values */
        xDown = null;
        yDown = null;       
        evt.preventDefault();                                                        
    };
}
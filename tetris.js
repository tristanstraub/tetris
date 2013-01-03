$(function(){
    /* (ps:ps 
       (defun make-multi-array (w h)
         (let ((result (make-array)))
           (loop repeat w
             for row = (make-array)
             do
               (push row result)
               (loop repeat h
                 do
                   (push nil row)))))
       (defun Piece ()
         (setf this.cells (make-multi-array 4 4))))
      

     */

      var Piece = function() {
          this.cells = [];
          for(var i=0;i<4;i++) {
              var row = [];
              this.cells.push(row);
              for(var j=0;j<4;j++) {
                  row.push(false);
              }
          }
          this.top = 0;
          this.left = 8;
      };

      var undraw_piece = function(board, piece) {
          for(var i=0;i<4;i++) {
              for(var j=0;j<4;j++) {
                  if (piece.cells[i][j]) {
                      board.squares[piece.top+i][piece.left+j].el.removeClass('set');
                      board.squares[piece.top+i][piece.left+j].empty = true;
                  }
              }
          }
      };

      var draw_piece = function(board, piece) {
          for(var i=0;i<4;i++) {
              for(var j=0;j<4;j++) {
                  if (piece.cells[i][j]) {
                      board.squares[piece.top+i][piece.left+j].el.addClass('set');
                      board.squares[piece.top+i][piece.left+j].empty = false;
                  }
              }
          }
      };

      var Board = function(w,h) {
          this.squares = [];
          this.w = w;
          this.h = h;
          init_board(this);

          this.piece = null;
      };

      var Square = function () {
          this.empty = true;
      };

      var init_board = function(board) {
          var sq = null;

          for(var i=0;i<board.h;i++) {
              var row = [];
              for(var j=0;j<board.w;j++) {
                  sq = new Square();
                  row.push(sq);
              }
              board.squares.push(row);
          }
      };

      var draw_board = function(board) {
          var field = $('.field');
          var sq = null;
          for(var i=0;i<board.h;i++) {
              var row = $('<div/>').addClass('row');
              field.append(row);
              for(var j=0;j<board.w;j++) {
                  sq = board.squares[i][j];
                  sq.el = $('<div/>');
                  sq.el.addClass('square').appendTo(row);
              }
          }                    
      };

      var update_board = function() {
          
      };

      var new_piece = function() {
          var piece = new Piece();
          var index = Math.floor(Math.random()*4);
          if (index == 0) {
              piece.cells[1][1] = true;
              piece.cells[1][2] = true;
              piece.cells[2][1] = true;
              piece.cells[2][2] = true;              
          } else if (index == 1) {
              piece.cells[0][1] = true;
              piece.cells[1][1] = true;
              piece.cells[2][1] = true;
              piece.cells[3][1] = true;              
          } else if (index == 2) {
              piece.cells[0][0] = true;
              piece.cells[0][1] = true;
              piece.cells[1][1] = true;
              piece.cells[1][2] = true;              
          } else if (index == 3) {
              piece.cells[1][0] = true;
              piece.cells[1][1] = true;
              piece.cells[0][1] = true;
              piece.cells[0][2] = true;              
          }

          return piece;
      };

      var can_move_piece_left = function(board, piece) {
              for(var i=0;i<4;i++) {
                  for(var j=0;j<4;j++) {
                      if (piece.cells[i][j] && ((piece.left-1+j) < 0 || !board.squares[piece.top+i][piece.left+j-1].empty))
                          return false;
                  }
              }
              return true;          
      };

      var can_move_piece_right = function(board, piece) {
              for(var i=0;i<4;i++) {
                  for(var j=0;j<4;j++) {
                      if (piece.cells[i][j] && ((piece.left+1+j) >= board.squares[0].length || !board.squares[piece.top+i][piece.left+j+1].empty))
                          return false;
                  }
              }
              return true;          
      };

      var can_move_piece_down = function(board, piece) {
          undraw_piece(board, piece);
          try {
              for(var i=0;i<4;i++) {
                  for(var j=0;j<4;j++) {
                      if (piece.cells[i][j] && ((piece.top+1+i) >= board.squares.length || !board.squares[piece.top+1+i][piece.left+j].empty))
                          return false;
                  }
              }
              return true;          
          } finally {
              draw_piece(board, piece);              
          }
      };

      var can_place = function(board, piece) {
        return false;  
      };

      var can_rotate = function(board, piece) {
          undraw_piece(board, piece);
          try {
              for(var i=0;i<4;i++) {
                  for(var j=0;j<4;j++) {
// rot[3-j][i] = piece.cells[i][j];
                      var ny = piece.top+3-j;
                      var nx = piece.left+i;
                      if (piece.cells[i][j] && (nx <0 || nx >= board.squares[0].length || ny < 0 || ny >= board.squares.length || !board.squares[ny][nx].empty))
                          return false;
                  }
              }
              return true;          
          } finally {
              draw_piece(board, piece);              
          }
      };

      var undraw_square = function(sq) {
        if (!sq.empty) {  
            sq.el.removeClass('set');
            sq.empty = true;
        }
      };

      var empty_row = function(board, row) {
          for(var i=0;i<board.squares[0].length;i++) {
              undraw_square(board.squares[row][i]);
          }
      };

      var move_rows_down_from_above = function(board, row) {
          for(var i=row-1;i>=0;i--) {
              for(var j=0; j<board.squares[0].length;j++) {
                  var empty = board.squares[i][j].empty;
                  board.squares[i][j].empty = true;
                  board.squares[i+1][j].empty = empty;
                  if (!empty) {
                      board.squares[i][j].el.removeClass('set');
                      board.squares[i+1][j].el.addClass('set');
                  }
              }
          }
      };

      var solve_rows = function(board) {
          for(var i=0; i < board.squares.length;i++) {
              var full = true;
              for(var j=0; j < board.squares[0].length; j++) {
                  if (board.squares[i][j].empty) {
                      full = false;
                      break;
                  }
              }
              if (full) {
                  empty_row(board,i);
                  move_rows_down_from_above(board,i);
              }
          }
      };

      var move_piece_down = function(board, piece) {
        if (!board.piece)
            return;
          if (can_move_piece_down(board, board.piece)) {
              undraw_piece(board, piece);
              board.piece.top += 1;              
              draw_piece(board, piece);
          } else {
              solve_rows(board);

              board.piece = new_piece();
              draw_piece(board, board.piece);
          }
      };

      var rotate_piece = function(board, piece) {
           undraw_piece(board, piece);
          // clockwise
          var rot = [];
          for(var i=0;i<piece.cells.length;i++){
              var row = [];
              rot.push(row);
              for(var j=0;j<piece.cells.length;j++){
                  row.push(false);                  
              }
          }
          for(i=0;i<piece.cells.length;i++){
              var row = [];
              for(var j=0;j<piece.cells.length;j++){
                  rot[3-j][i] = piece.cells[i][j];
              }
          }
          piece.cells = rot;
          draw_piece(board, piece);
      };

      var drop_piece = function(board, piece) {
          while(can_move_piece_down(board, piece)) {
              move_piece_down(board, piece);
          }
      };

      var clear_rows = function() {

      };

      var iterations = 0;

      var handle_keys = function() {
          if (keypresses.length == 0)
              return;
          var kc = keypresses.shift();
          console.log(kc);
        if (kc == 37) {
            // left
            if (board.piece) {
                undraw_piece(board, board.piece);                
                if (can_move_piece_left(board, board.piece)) {
                    board.piece.left--;
                }
                draw_piece(board, board.piece);                
            }
        } else if (kc == 39) {
            // right            
            if (board.piece)  {
                undraw_piece(board, board.piece);
                if (can_move_piece_right(board, board.piece)) {
                    board.piece.left++;
                }
                draw_piece(board, board.piece);              
            }

        } else if (kc == 32) {
            // space -- rotate
            if (can_rotate(board, board.piece)) {
                rotate_piece(board, board.piece);
            }
        } else if (kc == 40) {
            // down arrow
            if (board.piece) {
                drop_piece(board, board.piece);
            }
        }
      };

      var game_loop = function () {
          if (board.piece == null) {
              board.piece = new_piece();
              draw_piece(board, board.piece);
          }

          if (board.piece && iterations % 15 == 0) {
              move_piece_down(board, board.piece);
          }

          handle_keys();

          animFrame(game_loop);
          iterations++;
      };
      var lastTime = 0;
      var animFrame = window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            null;
      var board = null;

      var keys = [];
      var keypresses = [];
      var add_key_handlers = function() {
          $(window)/*.keydown(function(e) {
                                keys[e.keyCode] = true;
                                console.log(e.keyCode);
                            })
              .keyup(function(e) {
                         keys[e.keyCode] = false;
                     }).*/
              .keydown(function(e) {
                           console.log(e.which);
                           keypresses.push(e.which);
                       });
      };

      var main = function () {
          board = new Board(16,24);
          draw_board(board);

          add_key_handlers();

          animFrame(game_loop);
      };
      main();
});

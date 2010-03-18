" This my vimrc has been collected from the vast reaches of the 'net.
"
"   See also: http://delicious.com/noah/vim
"
"   ``VIM is the greatest editor since the stone chisel.''
"                                     
"                               - Jose Unpingco
"
""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
" General
""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
set nocompatible        " use vim defaults (not vi); !MUST BE FIRST LINE!
set number              " line numbers on
set mouse=a             " enable mouse in all modes
set fileencoding=utf-8 
set timeoutlen=0        " time to wait after ESC
set history=400         " number of lines of Ex command history to save
set hidden              " allow to change buffer w/o saving
" statusline
" cf the default statusline: %<%f\ %h%m%r%=%-14.(%l,%c%V%)\ %P
" format markers:
"   %< truncation point
"   %n buffer number
"   %f relative path to file
"   %m modified flag [+] (modified), [-] (unmodifiable) or nothing
"   %r readonly flag [RO]
"   %y filetype [ruby]
"   [%{&fo}] value of format-options
"   %= split point for left and right justification
"   %-35. width specification
"   %l current line number
"   %L number of lines in buffer
"   %c current column number
"   %V current virtual column number (-n), if different from %c
"   %P percentage through buffer (smart, includes 'Top' and 'Bot'
"     markers)
"   %) end of width specification
set statusline=%<\ %n:%f\ %m%r%y[%{&fo}]%=%-35.(L\ %l\ /\ %L;\ C\ %c%V\ (%P)%)

""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
" Colors and syntax highlighting
""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
filetype on             " enable filetype plugins
filetype indent on
filetype plugin on
set t_Co=256
set background=dark
syntax on                   " syntax highlighting on
colorscheme summerfruit256
set showmatch             " show matching paren when bracked inserted

""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
" Movement
""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
" set H and L to first and last character of line
map H ^
map L $
set whichwrap+=<,>,h,l    " allow cursor keys to wrap around columns
" easier switch between windows
map <C-j> <C-W>j
map <C-k> <C-W>k
map <C-h> <C-W>h
map <C-l> <C-W>l

""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
" Toggles
""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
" F6 -- paste 
set pastetoggle=<F6>    
" F7 -- spellchecking
map <F7> :setlocal spell! spelllang=en_us<CR> 

""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
" Wrapping, yo
""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
" Maximum width of text that is being inserted.  A longer line will be 
" broken after white space to get this width.  A zero value disables this. 
set textwidth=72 
" This is a sequence of letters which describes how automatic formatting is 
" to be done.   See fo-table
set formatoptions=cqt 
set wrapmargin=0
set wrap                  " wrap lines
" make horizontal scrolling in wrap more useful
set sidescroll=5          
set listchars+=precedes:<,extends:>

""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
" Search and regex
""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
set incsearch             " highlight where the typed pattern matches
set hlsearch              " highlight all searched-for phrases
set ignorecase            " case ignored in search
set smartcase             " case ignored unless upper case used
set magic                 " magic on

""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
" Completion
""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
set wildmenu              " tab-complete Ex commands
set wildmode=list:longest 
set completeopt=menu      " use popup menu to show completions
" autocomplete functions and identifiers for languages
setlocal omnifunc=syntaxcomplete#Complete

""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
" Folding
""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
set nofoldenable          " open all folds
set foldmethod=manual     " manual, marker, syntax, try set foldcolumn=2

""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
" Command line
""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
set cmdheight=2           " use 2 screen lines for command-line
" always open command line window
nnoremap : q:i
nnoremap / q/i
nnoremap ? q?i

""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
" Visual appearance
""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
set ruler                 " show cursor coords
set vb t_vb=              " neither beep nor flash
set scrolloff=3           " minimum number of lines above/below cursor (when scrolling)
map <silent> <F14>   :let &number=1-&number<CR>
set laststatus=2          " always show the status line
set showcmd               " Show (partial) command in the last line of the screen.

""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
" Tabs and spaces
""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
" In Insert mode: Use the appropriate number of spaces to insert a <Tab>
set expandtab             
" Copy indent from current line when starting a new line (via <CR> or "o")
set autoindent
" Number of spaces to use for autoindent (and >> <<)
set shiftwidth=2

""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
" NERDTree
""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
autocmd VimEnter * NERDTree
autocmd VimEnter * wincmd p

""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
" Functions
""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
"                                               AutoModeChange()
function AutoModeChange()
  " Automatically give executable permissions if file begins with #!
  " and contains '/bin/' in the path
  if getline(1) =~ "^#!"
    if getline(1) =~ "/bin/"
      silent !chmod 755 %
    endif
  endif
endfunction
au BufWritePost * call AutoModeChange()

" show scratch function prototype even when only one match
set cot+=menuone

filetype plugin indent on

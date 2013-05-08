set nosmartindent
setlocal tabstop=4
setlocal softtabstop=4
setlocal shiftwidth=4
setlocal textwidth=80
setlocal smarttab
setlocal expandtab
setlocal foldmethod=indent

set foldexpr=PythonFoldExpr(v:lnum)
set foldtext=PythonFoldText()


map <buffer> <S-e> :w<CR>:!/usr/bin/env python2 % <CR>

function! PythonFoldText()

    let size = 1 + v:foldend - v:foldstart
    if size < 10
        let size = " " . size
    endif
    if size < 100
        let size = " " . size
    endif
    if size < 1000
        let size = " " . size
    endif
    
    if match(getline(v:foldstart), '"""') >= 0
        let text = substitute(getline(v:foldstart), '"""', '', 'g' ) . ' '
    elseif match(getline(v:foldstart), "'''") >= 0
        let text = substitute(getline(v:foldstart), "'''", '', 'g' ) . ' '
    else
        let text = getline(v:foldstart)
    endif
    
    return size . ' lines:'. text . ' '

endfunction

function! PythonFoldExpr(lnum)

    if indent( nextnonblank(a:lnum) ) == 0
        return 0
    endif
    
    if getline(a:lnum-1) =~ '^\(class\|def\)\s'
        return 1
    endif
        
    if getline(a:lnum) =~ '^\s*$'
        return "="
    endif
    
    if indent(a:lnum) == 0
        return 0
    endif

    return '='

endfunction

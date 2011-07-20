" LaTeX filetype
"	  Language: LaTeX (ft=tex)
"	Maintainer: Srinath Avadhanula
"		 Email: srinath@fastmail.fm

set nosmartindent
setlocal tabstop=4
setlocal softtabstop=4
setlocal shiftwidth=4
setlocal textwidth=0
setlocal smarttab
setlocal nospell


map <buffer> <S-e> :w<CR>:!Makefile  <CR>
if !exists('s:initLatexSuite')
	let s:initLatexSuite = 1
	exec 'so '.fnameescape(expand('<sfile>:p:h').'/latex-suite/main.vim')

	silent! do LatexSuite User LatexSuiteInitPost
endif

silent! do LatexSuite User LatexSuiteFileType



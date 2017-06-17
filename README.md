### functions
- help
    `chromeish -h/--help`
- list open tabs
    `chromeish ls` shows title (url)
    `chromeish ls -s/--show [t|u|i|n|w|d|p|a|s]` show fields:
	title | url | id | index | window id | discarded | pinned | audible (true/false/muted) | status (loading/complete)
    `chromeish ls -l/--list` show all fields
    `chromeish ls -o/--omit-settings` omit settings pages (ie chrome://-prefixed pages)
    `chromeish ls -w/--window` by window ???
    `chromeish ls -h/--hidden` include hidden
    `chromeish ls -W` list windows (also `chromeish wls`)

- get tab info # may not be necessary since you can just `ls -l | grep`
    `chromeish i/info -k/--key [tab(s)]` returns 

- cat tab
    `chromeish cat -k [tab(s)]`

- focus tab
    `chromeish focus -k [tab(s)]`

- close tab
    `chromeish rm -k [key] [tab(s)]`

- move tab
    `chromeish move -k [key] -n [index] -w [window id] [tab(s)]`
    	default
		key: id
		index: current index
		window id: current window id
    `chromeish move -N [tab(s)]` move to new window

- reload tab
    `chromeish reload -k [tab(s)]`

- discard/disable
    `chromeish disable -k [tab(s)]`

- open new tab, kinda redundant
    `chromeish open [url(s)]`

* key?=(t,u,i) defaults to id

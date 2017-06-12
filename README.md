TODO:

### basic
- communicate w client probably via REST...should i use node UGH

### functions
- GET /chromeish/tabs
	list open tabs
	`chromeish ls`
- GET /chromeish/tabs/url_id
	get tab ids from url (tab separated)
	`chromeish url <url>`
- GET /chromeish/tabs/title_id
	get tab id from title
	`chromeish title <title>`
- GET /chromeish/tabs/id
	get title and window from id
	`chromeish id <id>`
- GET /chromeish/windows
    	list open windows
	this doesn't make sense actually
- GET /chromeish/tabs/cat tab
	cat tab
	`chromeish cat <tab id>`
- POST /chromeish/tabs/open tab
    	`chromeish open <url>`
 	open new tab, kinda redundant
- POST /chromeish/tabs/close tab
        `chromeish close <id>`
	close tab
- POST /chromeish/tabs/move tab window
       	`chromeish move <id> <other stuff>`
	move tab?
- reload
- discard

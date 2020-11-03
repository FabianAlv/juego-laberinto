/* Para bodies que son mas grandes que el html hay que cambiar la forma en la que se despliegan */
const html = document.documentElement;
const body = document.body;

const htmlHeight = html.clientHeight;
const bodyHeigth = body.clientHeight;

if (htmlHeight < bodyHeigth) 
	html.className += 'bigContainer';


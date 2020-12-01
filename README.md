# iipsen2-node-api
The express api for our iipsen2 project.

### Installation
Clone the repository

**Setup your editor**
Set your linter to Standard JS
  * [webstorm](https://standardjs.com/webstorm.html)
  * [vscode](https://marketplace.visualstudio.com/items?itemName=chenxsan.vscode-standardjs)

Set tab size to 2 spaces

Next install postgresSQL en setup a database.
After that copy the file .sample-env and rename it to .env
Then in the .env file set all the configuration for the database.

In postgresql execute the statements from the file sql/init.sql.

**Install the requirements**
```bash
npm install
```

### Run
You can run the project by using our start script. In the main directory run:
```bash
npm start
```
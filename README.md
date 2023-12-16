# MoneyMap-Hackathon

## MoneyMap is a user-friendly web application dedicated to simplifying financial management.

\*Our platform offers a robust expense tracker, enabling users to monitor their spending habits with ease. The intuitive dashboard presents categorized expenses.

\*The reminders feature ensures timely payment and task management. Users can effortlessly add, view, and delete expenses, fostering a proactive approach to financial well-being.

\*Additionally, our AI advice section provides
personalized insights based on user queries. With a
sleek and organized design, MoneyMap prioritizes
user experience and efficiency. Whether you're
tracking daily expenditures or setting up weekly
reminders, MoneyMap is your go-to financial
companion.

# How to configure?

## For most functionality:
- run npm i in the project directories terminal to install all required dependencies
- setup a firebase project, along with the service account and generate the serviceAccountKey.json and save to the ./ main directory
- also, make three collections (users, reminders, expenses). Rest documents and respective fields will be managed by the server.
- to start the project on localhost:3000 (Note: port can be changed through the server.js), run npm start (custom script to run the website in development mode using nodemon)

## For additional funcitionality like AI Advice:
- install ollama (Available for Linux, Mac OS)
- incase you have windows, you can use WSL(Windows Subsystem for Linux) and install it there
- install llama using the ollama run llama2 cli command
- for further, more indepth instructions do check out the Ollama Docs ( https://github.com/jmorganca/ollama/ )

## Working Screenshots:

Ai Advice:
![image](https://github.com/kartikm7/MoneyMap-Hackathon/assets/108652656/6ee5ed7a-f541-427d-9723-15a0ca0f7fac)


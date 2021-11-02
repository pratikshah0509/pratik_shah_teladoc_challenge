# pratik_shah_teladoc_challenge

Some of the below commands might need you to use ```sudo``` before the command

1.Homebrew 
2.Java 1.8
3.Add the following to `~/.bash_profile`
4.Install Typescript

```$xslt
brew install -g typescript
```

5.NodeJS version 8 minimum

```$xslt
brew install node@8
```

6.NVM is used to manage different versions of node (optional install)

7.Webdriver Manager - Used to bring up selenium server and manage chrome drivers

```$xslt
npm install -g webdriver-manager
```

8.Maven - Used for reporting plugin

```$xslt
brew install maven
```

## Automation Setup

- Clone the repository:

```$xslt
git clone git@gitlab.com:Evisort/engineering/evisort-e2e.git
```

- Inside your project root, pull in the dependencies

```$xslt
npm install
```

- Build reports directory and monitor changes

```$xslt
gulp
```

- Compile and build the typescript

```$xslt
npm run clean-build
```

## Automation Execution

- Ensure you have the latest drivers. In a terminal within the project

```$xslt
webdriver-manager update
```

- Start the selenium server

```$xslt
webdriver-manager start
```

- Open a new terminal and execute the existing cucumber scenarios

```$xslt
npm run cucumber
```


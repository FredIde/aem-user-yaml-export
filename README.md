# AEM User Export

This small nodejs script makes it possible to export all users including their user group membership as they're directly from a running AEM instance. The export format is a YAML file which can be imported by the Access Control Tool for Adobe Experience Manager (https://github.com/Netcentric/accesscontroltool). This makes it possible to migrate users and their roles between AEM instances. This tool is build for environments which authenticate the user externally (SAML, LDAP) and don't authenticate against internally stored passwords.

## Setup

Clone or download the repository
```
git clone https://github.com/sbrinkmann/aem-user-yaml-export.git
```

Install missing node modules
```
cd aem-user-yaml-export
npm install
```


## Run
To run the script just call ``./aem-user-yaml-export.js``

It is possible to add the following options while calling to define the AEM instance you want to connect to and where the result should be stored.
```
  -h, --hostname string
  --port number
  -u, --username string
  -p, --password string`
  -f, --filename string
  -i, --ignoreUsers string[]
  --ignoreUnprivileged
```
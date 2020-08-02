const admin = require('firebase-admin')
const { readFile } = require('fs')

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: "https://olapp-6c8ab.firebaseio.com"
})

const database = admin.database()

readFile(process.argv[2], 'utf-8', (err, data) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }

  const lines = data.split('\n').slice(1)
  const membersRef = database.ref('/members')
  
  membersRef.once('value', membersSnapshot => {
    const members = membersSnapshot.val() || {}

    const groupsRef = database.ref('/groups')
    groupsRef.once('value', snapshot => {
      const groupNameMap = {}
      const groupMembers = {}
      const groups = snapshot.val() || {}
      for (let id in groups) {
        const group = groups[id]
        groupNameMap[group.name] = groupsRef.child(id)
      }

      lines.forEach(line => {
        const cols = line.split(',')
        const isGuardian = cols[1].trim()
        if (!isGuardian) {
          const id = cols[4]
          const groupName = cols[0]

          let groupRef = groupNameMap[groupName]
          if (!groupRef) {
            groupRef = groupNameMap[groupName]= groupsRef.push()
            groupRef.set({ name: groupName }, awaitCb())
          }
          if (!groupMembers[groupRef.key]) {
            groupMembers[groupRef.key] = { members: {} }
          }

          groupMembers[groupRef.key].members[id] = true

          const memberGroups = (members[id] && members[id].groups) || {}
          memberGroups[groupRef.key] = true

          const phone = cols[6].startsWith('46')
            ? '+' + cols[6] 
            : cols[6].startsWith('0')
            ? cols[6]
            : '0' + cols[6] 

          members[id] = {
            ...members[id],
            name: [cols[2], cols[3]].join(' '),
            phone,
            email: cols[7],
            birthdate: cols[5],
            groups: memberGroups
          }

          
          membersRef.child(id).set(members[id], awaitCb())          
          console.log(members[id].name)
        }
      })

      groupsRef.set(groupMembers, awaitCb())
    })
  })

  let waitCount = 0
  function awaitCb() {
    waitCount++

    return err => {
      if (err) {
        console.error(err)
        process.exit(1)
      }

      if (--waitCount <= 0) {
        process.exit(0)
      }
    }
  }
})

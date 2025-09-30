const sqlite3 = require('sqlite3').verbose();

function checkBackupDatabase() {
  return new Promise((resolve, reject) => {
    console.log('🔍 Verificando banco de backup...')

    const db = new sqlite3.Database('back-up modelo-site/prisma/dev.db', sqlite3.OPEN_READONLY, (err) => {
      if (err) {
        console.error('❌ Erro ao abrir banco de backup:', err.message)
        reject(err)
        return
      }
      console.log('✅ Banco de backup aberto com sucesso!')
    })

    // Verificar se a tabela properties existe
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='properties'", (err, row) => {
      if (err) {
        console.error('❌ Erro ao verificar tabela:', err.message)
        reject(err)
        return
      }

      if (!row) {
        console.log('⚠️  Tabela properties não encontrada no backup')
        db.close()
        resolve()
        return
      }

      console.log('✅ Tabela properties encontrada!')

      // Contar imóveis
      db.get("SELECT COUNT(*) as count FROM properties", (err, row) => {
        if (err) {
          console.error('❌ Erro ao contar imóveis:', err.message)
          reject(err)
          return
        }

        console.log(`📊 Total de imóveis no backup: ${row.count}`)

        if (row.count > 0) {
          // Listar alguns imóveis
          db.all("SELECT id, title, type, price FROM properties LIMIT 10", (err, rows) => {
            if (err) {
              console.error('❌ Erro ao listar imóveis:', err.message)
              reject(err)
              return
            }

            console.log('\n📋 Primeiros 10 imóveis do backup:')
            rows.forEach((row, index) => {
              console.log(`${index + 1}. ${row.title} - ${row.type} - R$ ${row.price}`)
            })

            db.close()
            resolve()
          })
        } else {
          db.close()
          resolve()
        }
      })
    })
  })
}

checkBackupDatabase().catch(console.error)
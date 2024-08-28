let mysql = require("mysql2/promise");
var Logger = require("./lib/logger");
var Promise = require("promise");
// database self.gameserver.getAccountById(_id)
module.exports = class DataBase {
  constructor(wait = false) {
    var self = this;
    this.connection = null;
    this.host = "localhost";
    this.user = "root";
    this.password = "rootpassword";
    this.database = "dragonbound";

    if (!wait) {
      this.connection = mysql.createPool({
        connectionLimit: 500,
        host: self.host,
        user: self.user,
        password: self.password,
        database: self.database,
      });
      if (this.connection !== null) {
        Logger.normal("MYSQL Connect!");
      }
    }
  }

  static async init() {
    const database = new DataBase(true);

    return new Promise((resolve, reject) => {
      database.connection = mysql.createPool({
        connectionLimit: 500,
        host: database.host,
        user: database.user,
        password: database.password,
        database: database.database,
      });

      if (database.connection !== null) {
        Logger.normal("MYSQL Connect!");
        resolve(database);
      } else {
        reject("Error connecting to the database");
      }
    });
  }

  getConnection() {
    console.log("ga");
    return this.connection;
  }

  getAccountByUsername(user) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query(
            "SELECT Id, Session, Password FROM accounts where Username = ?",
            [user]
          )
          .then((rows) => {
            conn.release();
            if (rows[0].length > 0) return resolve(rows);
            else return reject();
          });
      });
    });
  }
  updateAct(a) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query("UPDATE users SET activate = 2 WHERE game_id = ?", [a])
          .then((rows) => {
            conn.release();
            if (rows[0].length > 0) return reject();
            else return resolve();
          });
      });
    });
  }
  getUserByIdAcc(id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query(
            "SELECT rank, game_id, gender, country, banned FROM users where IdAcc = ?",
            [id]
          )
          .then((rows) => {
            conn.release();
            if (rows[0].length > 0) return resolve(rows);
            else return reject();
          });
      });
    });
  }

  getAllPlayersGP() {
    return new Promise((resolve, reject) => {
      const query = "SELECT IdAcc, gp FROM users";
      this.connection.query(query, (error, results) => {
        if (error) {
          console.error("Database error:", error);
          return reject(error);
        }
        resolve(results); // Return the array of objects with IdAcc and gp
      });
    });
  }
  getUserByBannedTest(id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query(
            "SELECT u.rank, u.game_id, u.country, u.banned, b.razon, b.date FROM users u INNER JOIN banned b ON b.UserId = u.IdAcc WHERE u.IdAcc = ?",
            [id]
          )
          .then((rows) => {
            conn.release();
            if (rows[0].length > 0) return resolve(rows);
            else return reject();
          });
      });
    });
  }
  EventNotice() {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn.query("SELECT * FROM noticias").then((rows) => {
          conn.release();
          if (rows[0].length > 0) {
            return resolve(rows);
          } else return reject();
        });
      });
    });
  }
  getUserByIdAccGame(id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query(
            "SELECT u.Id, u.gm, u.IdAcc, u.country, u.banned, u.game_id,u.lucky_egg, u.rank, u.gp, u.gold, u.cash, u.name_changes, u.gender, u.photo_url, u.power_user, u.plus10gp, u.map_pack, u.megaphones, u.is_muted, u.win, u.loss, u.prixw, u.probability, u.IP, u.block_friend, u.CashCharger, u.lucky_egg_sec_left, u.electrico, ae.head, ae.body, ae.eyes, ae.flag, ae.background, ae.foreground, ac.PinUser, ac.Session, ac.no_win_bonus, ev.Server_Id, ev.historychat, ev.date, ev.time, ev.tipo, ev.server_tournament_state, ev.holiday, ev.server_check, ev.first_important_ranks, it.tournament_server, it.tournament_start_time, it.tournament_end_time, it.tournament_gifts_users, it.tournament_state_server, it.tournament_check FROM users u INNER JOIN user_avatar_equiped ae ON u.Id = ae.Id INNER JOIN accounts ac ON ac.Id = u.IdAcc INNER JOIN event_game ev ON ev.Server_Id = 1 INNER JOIN info_tournament it ON it.tournament_server = 5 WHERE u.IdAcc = ?",
            [id]
          )
          .then((rows) => {
            conn.release();
            if (rows[0].length > 0) return resolve(rows);
            else return reject();
          });
      });
    });
  }

  getGuildByIdAcc(id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query(
            "SELECT m.Id, m.Job, g.Name, g.points from guild_member m INNER JOIN guild g ON m.Id = g.Id WHERE m.UserId = ?",
            [id]
          )
          .then((rows) => {
            conn.release();
            if (rows[0].length > 0) return resolve(rows);
            else return reject();
          });
      });
    });
  }

  getGuildMembersById(id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query(
            "SELECT m.Job, u.game_id, u.IdAcc, u.rank, u.gp, u.gender, u.photo_url, ac.IsOnline from guild_member m INNER JOIN guild g ON m.Id = g.Id INNER JOIN users u ON m.UserId = u.IdAcc INNER JOIN accounts ac ON ac.Id = u.IdAcc WHERE g.Id = ?",
            [id]
          )
          .then((rows) => {
            conn.release();
            if (rows[0].length > 0) return resolve(rows);
            else return reject();
          });
      });
    });
  }

  getFriendsByIdyo(id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query(
            "SELECT u.IdAcc, u.gp, u.game_id, u.photo_url, u.rank, a.IsOnline FROM users u INNER JOIN friends ds ON u.IdAcc = ds.id_amigo INNER JOIN accounts a ON u.IdAcc = a.Id ANd ds.id_yo = ?",
            [id]
          )
          .then((rows) => {
            conn.release();
            if (rows[0].length > 0) return resolve(rows);
            else return reject();
          });
      });
    });
  }

  getMyFriend(user_id, friend_id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query(
            "SELECT id_yo, id_amigo FROM friends WHERE id_yo = ? AND id_amigo = ?",
            [user_id, friend_id]
          )
          .then((rows) => {
            conn.release();
            if (rows[0].length > 0) return resolve(rows);
            else return reject();
          });
      });
    });
  }

  putFriends(user_id, friend_id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query("INSERT into friends SET id_yo = ?, id_amigo = ?", [
            user_id,
            friend_id,
          ])
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0) return resolve(rows);
            else return reject();
          });
      });
    });
  }

  deleteFriendsByIdFriendYo(id_yo, id_amigo) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query("DELETE FROM friends WHERE id_yo = ? and id_amigo = ?", [
            id_yo,
            id_amigo,
          ])
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0 || rows[0].changedRows > 0)
              return resolve(rows);
            else return reject();
          });
      });
    });
  }
  getLuckyEggs(user_id, cb) {
    var self = this;
    self.connection.getConnection().then((conn) => {
      conn
        .query(
          "SELECT amount FROM user_avatars WHERE UserId = ?  AND aId = 2319 LIMIT 1",
          [user_id]
        )
        .then((rows) => {
          conn.release();
          cb(rows[0].length > 0 ? rows[0][0].amount : 0);
        });
    });
  }
  getMegaphone(user_id, cb) {
    var self = this;
    self.connection.getConnection().then((conn) => {
      conn
        .query(
          "SELECT amount FROM user_avatars WHERE UserId = ?  AND aId = 894 LIMIT 1",
          [user_id]
        )
        .then((rows) => {
          conn.release();
          cb(rows[0].length > 0 ? rows[0][0].amount : 0);
        });
    });
  }
  removeLuckyEgg(user_id, cb) {
    var self = this;
    self.connection.getConnection().then((conn) => {
      conn
        .query(
          "DELETE FROM user_avatars WHERE UserId = ?  AND aId = 2319 LIMIT 1",
          [user_id]
        )
        .then((rows) => {
          conn.release();
          cb();
        });
    });
  }
  removeMegaphone(user_id, cb) {
    var self = this;
    self.connection.getConnection().then((conn) => {
      conn
        .query(
          "DELETE FROM user_avatars WHERE UserId = ?  AND aId = 894 LIMIT 1",
          [user_id]
        )
        .then((rows) => {
          conn.release();
          cb();
        });
    });
  }
  getUserAvatarsByIdAcc(id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query(
            "SELECT Id, UserId, aId, type, is_cash, is_gift, amount, expire_time FROM user_avatars WHERE UserId = ?  AND remove_ava = 0",
            [id]
          )
          .then((rows) => {
            conn.release();
            if (rows[0].length > 0) return resolve(rows);
            else return reject();
          });
      });
    });
  }

  getMenbrPrixByPunts(id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query(
            "SELECT Id, IdAcc, game_id, rank, prixw FROM users WHERE prixw >= ? ORDER BY prixw DESC",
            [id]
          )
          .then((rows) => {
            conn.release();
            if (rows[0].length > 0) return resolve(rows);
            else return reject();
          });
      });
    });
  }

  getUserRelationByIdAcc(id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query(
            "SELECT m.user_id, m.relationship_status, m.relationship_with_id, p.rank, p.photo_url, p.game_id, p.gender FROM relationship m LEFT JOIN users p ON m.relationship_with_id = p.IdAcc WHERE m.user_id = ?",
            [id]
          )
          .then((rows) => {
            conn.release();
            if (rows[0].length > 0) return resolve(rows);
            else return reject();
          });
      });
    });
  }

  deleteAvatarExpireByUserId(time, UserId) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query(
            "DELETE FROM user_avatars WHERE expire_time < ? AND expire_time > 0 AND UserId = ?",
            [time, UserId]
          )
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0 || rows[0].changedRows > 0)
              return resolve(rows);
            else return reject();
          });
      });
    });
  }

  deleteAvatarById(Id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query("UPDATE user_avatars SET remove_ava = 1 WHERE Id = ?", [Id])
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0 || rows[0].changedRows > 0)
              return resolve(rows);
            else return reject();
          });
      });
    });
  }

  putPinCode(pin, seller, gm, gm_id, rode, state) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query(
            "INSERT into pin_code SET pin = ?, seller = ?, gm = ?, gm_id = ?, used_by = 0, rode = ?, state = ?, date_time = 0",
            [pin, seller, gm, gm_id, rode, state]
          )
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0) return resolve(rows);
            else return reject();
          });
      });
    });
  }

  getPinCodeByPin(pin) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query(
            "SELECT id, seller, gm, rode, state FROM pin_code where pin = ?",
            [pin]
          )
          .then((rows) => {
            conn.release();
            if (rows[0].length > 0) return resolve(rows);
            else return reject();
          });
      });
    });
  }

  getRankSpecialByIdAcc(IdAcc) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query(
            "SELECT Id, IdAcc, rank, time FROM rankspecial WHERE IdAcc = ?",
            [IdAcc]
          )
          .then((rows) => {
            conn.release();
            if (rows[0].length > 0) return resolve(rows);
            else return reject();
          });
      });
    });
  }

  deleteSistemRankSpecialByIdAcc(IdAcc) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query("DELETE FROM rankspecial WHERE IdAcc = ?", [IdAcc])
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0 || rows[0].changedRows > 0)
              return resolve(rows);
            else return reject();
          });
      });
    });
  }

  updateRankByIdAcc(rank, user_id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query("UPDATE users SET rank = ? WHERE IdAcc = ?", [rank, user_id])
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0 || rows[0].changedRows > 0)
              return resolve(rows);
            else return reject();
          });
      });
    });
  }

  updatePreviousRank(rank, user_id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection
        .getConnection()
        .then((conn) => {
          conn
            .query("UPDATE users SET previous_rank = ? WHERE IdAcc = ?", [
              rank,
              user_id,
            ])
            .then((rows) => {
              conn.release();
              if (rows.affectedRows > 0 || rows.changedRows > 0) {
                resolve(rows);
              } else {
                reject(new Error("No rows affected"));
              }
            })
            .catch((err) => {
              conn.release();
              reject(err);
            });
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  getPlayerCurrentRank(user_id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection
        .getConnection()
        .then((conn) => {
          conn
            .query("SELECT rank FROM users WHERE IdAcc = ?", [user_id])
            .then((result) => {
              conn.release();
              if (result.length > 0 && result[0].length > 0) {
                resolve(result[0][0].rank);
              } else {
                reject(
                  new Error("No current rank found for user ID " + user_id)
                );
              }
            })
            .catch((err) => {
              conn.release();
              reject(err);
            });
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  getPlayerPreviousRank(user_id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection
        .getConnection()
        .then((conn) => {
          conn
            .query("SELECT previous_rank FROM users WHERE IdAcc = ?", [user_id])
            .then((result) => {
              conn.release();
              if (result.length > 0 && result[0].length > 0) {
                resolve(result[0][0].previous_rank);
              } else {
                reject(
                  new Error("No previous rank found for user ID " + user_id)
                );
              }
            })
            .catch((err) => {
              conn.release();
              reject(err);
            });
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  updateTimeByEventServer(date, time, tipo, server_event, id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query(
            "UPDATE event_game SET date = ?, time = ?, tipo = ?, server_check = ? WHERE Server_Id = ?",
            [date, time, tipo, server_event, id]
          )
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0 || rows[0].changedRows > 0)
              return resolve(rows);
            else return reject();
          });
      });
    });
  }

  updateStateByPrix(state, id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query(
            "UPDATE event_game SET server_tournament_state = ? WHERE Server_Id = ?",
            [state, id]
          )
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0 || rows[0].changedRows > 0)
              return resolve(rows);
            else return reject();
          });
      });
    });
  }

  deleteAvatarByUserID(user_id, Id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query("DELETE FROM user_avatars WHERE UserId = ? AND aId = ?", [
            user_id,
            Id,
          ])
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0 || rows[0].changedRows > 0)
              return resolve(rows);
            else return reject();
          });
      });
    });
  }

  getIpBannedById(IP) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query("SELECT game_id, rank, IdAcc, IP FROM users WHERE IP = ?", [
            IP,
          ])
          .then((rows) => {
            conn.release();
            if (rows[0].length > 0) return resolve(rows);
            else return reject();
          });
      });
    });
  }

  updateGPsByIdAcc(gp, user_id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query("UPDATE users SET gp = ? WHERE IdAcc = ?", [gp, user_id])
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0 || rows[0].changedRows > 0)
              return resolve(rows);
            else return reject();
          });
      });
    });
  }

  updateMutedByIdAcc(muted, user_id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query("UPDATE users SET is_muted = ? WHERE IdAcc = ?", [
            muted,
            user_id,
          ])
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0 || rows[0].changedRows > 0)
              return resolve(rows);
            else return reject();
          });
      });
    });
  }

  getSettingsByIdAcc(id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query(
            "SELECT IdAcc, game_id, photo_url, bg_url, country, rank, gp, win, gender, loss FROM users WHERE IdAcc = ?",
            [id]
          )
          .then((rows) => {
            conn.release();
            if (rows[0].length > 0) return resolve(rows);
            else return reject();
          });
      });
    });
  }

  updateSettingsByIdAcc(photo_url, page_bg_url, acc_id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query("UPDATE users SET photo_url = ?, bg_url = ? where IdAcc = ?", [
            photo_url,
            page_bg_url,
            acc_id,
          ])
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0 || rows[0].changedRows > 0)
              return resolve(rows);
            else return reject();
          });
      });
    });
  }

  getPosteoByIdAcc(user_id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query(
            "SELECT post_id, user_de, user_para, texto, fecha FROM user_post WHERE user_para = ?",
            [user_id]
          )
          .then((rows) => {
            conn.release();
            if (rows[0].length > 0) return resolve(rows);
            else return reject();
          });
      });
    });
  }

  getPostsOnlineByIdAcc(user_id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query(
            "SELECT up.post_id, up.user_de, up.user_para, up.texto, up.fecha, u.game_id, u.rank, u.IdAcc FROM user_post up INNER JOIN users u ON u.IdAcc = up.user_de WHERE up.user_para = ? ORDER BY up.post_id DESC limit 0, 19",
            [user_id]
          )
          .then((rows) => {
            conn.release();
            if (rows[0].length > 0) return resolve(rows);
            else return reject();
          });
      });
    });
  }

  putPosts(user_de, user_para, texto, fecha) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query(
            "INSERT into user_post SET user_de = ?, user_para = ?, texto = ?, fecha = ?",
            [user_de, user_para, texto, fecha]
          )
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0) return resolve(rows);
            else return reject();
          });
      });
    });
  }

  deletePostsByID(Id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query("DELETE FROM user_post WHERE post_id = ?", [Id])
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0 || rows[0].changedRows > 0)
              return resolve(rows);
            else return reject();
          });
      });
    });
  }

  updateGuildById(img, background, about, website, Id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query(
            "UPDATE guild SET img = ?, fondo = ?, about = ?, website = ? WHERE Id = ?",
            [img, background, about, website, Id]
          )
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0 || rows[0].changedRows > 0)
              return resolve(rows);
            else return reject();
          });
      });
    });
  }

  getPostComentsById(comment_id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query(
            "SELECT uc.coment_id, uc.comment_text, uc.comment_date, u.game_id, u.rank, u.IdAcc FROM user_coment uc INNER JOIN users u ON u.IdAcc = uc.user_from WHERE uc.user_to = ?",
            [comment_id]
          )
          .then((rows) => {
            conn.release();
            if (rows[0].length > 0) return resolve(rows);
            else return reject();
          });
      });
    });
  }

  getCoinsByGuildId(id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query(
            "SELECT gc.date, u.game_id FROM guild_coins gc INNER JOIN guild g ON g.Id = gc.guild_id INNER JOIN users u ON gc.member_id = u.IdAcc WHERE g.Id = ?",
            [id]
          )
          .then((rows) => {
            conn.release();
            if (rows[0].length > 0) return resolve(rows);
            else return reject();
          });
      });
    });
  }

  updatePasswordByNameId(password, id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query("UPDATE accounts SET Password = ? WHERE Id = ?", [
            password,
            id,
          ])
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0 || rows[0].changedRows > 0)
              return resolve(rows);
            else return reject();
          });
      });
    });
  }

  updateServerByUserId(server_id, user_id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query("UPDATE accounts SET IsOnline = ? WHERE Id = ?", [
            server_id,
            user_id,
          ])
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0 || rows[0].changedRows > 0)
              return resolve(rows);
            else return reject();
          });
      });
    });
  }

  updateProbability(punts, user_id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query("UPDATE users SET probability = ? WHERE IdAcc = ?", [
            punts,
            user_id,
          ])
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0 || rows[0].changedRows > 0)
              return resolve(rows);
            else return reject();
          });
      });
    });
  }

  updateGiftsByHoliday(gifts, id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query(
            "UPDATE event_game SET holiday = holiday + ? WHERE Server_Id = ?",
            [gifts, id]
          )
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0 || rows[0].changedRows > 0)
              return resolve(rows);
            else return reject();
          });
      });
    });
  }

  viewsServer1(server) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query("UPDATE servidores SET minUser = minUser + 1 WHERE Id = ?", [
            server,
          ])
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0 || rows[0].changedRows > 0)
              return resolve(rows);
            else return reject();
          });
      });
    });
  }

  viewsServer2(server) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query("UPDATE servidores SET minUser = minUser - 1 WHERE Id = ?", [
            server,
          ])
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0 || rows[0].changedRows > 0)
              return resolve(rows);
            else return reject();
          });
      });
    });
  }

  getUserAvatarsByIdAccANDaId(user_id, avatar_id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query(
            "SELECT Id, UserId, aId, type, is_cash, is_gift, amount, expire_time FROM user_avatars WHERE UserId = ? AND aId = ?",
            [user_id, avatar_id]
          )
          .then((rows) => {
            conn.release();
            if (rows[0].length > 0) return resolve(rows);
            else return reject();
          });
      });
    });
  }

  deleteBannedByIdAcc(IdAcc) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query("DELETE FROM banned WHERE UserId = ?", [IdAcc])
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0 || rows[0].changedRows > 0)
              return resolve(rows);
            else return reject();
          });
      });
    });
  }

  updateGuildPrixById(points, guild_id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query("UPDATE guild SET points = ? WHERE Id = ?", [points, guild_id])
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0 || rows[0].changedRows > 0)
              return resolve(rows);
            else return reject();
          });
      });
    });
  }

  getMyScreeRoomGameByLetters(screem_room) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query(
            "SELECT id, screenshot_letters, partida_screenshot FROM screenshot_game WHERE screenshot_letters = ?",
            [screem_room]
          )
          .then((rows) => {
            conn.release();
            if (rows[0].length > 0) return resolve(rows);
            else return reject();
          });
      });
    });
  }

  putMyScreeRoomGame(code_screenshot_random, screenshot) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query(
            "INSERT INTO screenshot_game SET screenshot_letters = ?, partida_screenshot = ?",
            [code_screenshot_random, screenshot]
          )
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0) return resolve(rows);
            else return reject();
          });
      });
    });
  }

  getMyReplayRoomGameByLetters(replay_room) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query(
            "SELECT replay_id, view_code, avatars_ids, code_rmd FROM view_replay WHERE view_code = ?",
            [replay_room]
          )
          .then((rows) => {
            conn.release();
            if (rows[0].length > 0) return resolve(rows);
            else return reject();
          });
      });
    });
  }

  putMyReplayRoomGame(view_code, avatars_ids, code_rmd /*, replay_code*/) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query(
            "INSERT INTO view_replay SET view_code = ?, avatars_ids = ?, code_rmd = ?",
            [view_code, avatars_ids, code_rmd /*, replay_code*/]
          )
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0) return resolve(rows);
            else return reject();
          });
      });
    });
  }

  getInfoTournamentByServerId(server_id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query(
            "SELECT id, tournament_server, tournament_start_time, tournament_end_time, tournament_gifts_users, tournament_state_server, tournament_check FROM info_tournament WHERE tournament_server = ?",
            [server_id]
          )
          .then((rows) => {
            conn.release();
            if (rows[0].length > 0) return resolve(rows);
            else return reject();
          });
      });
    });
  }

  getUsersPrixByFirstPlace(punts) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query(
            "SELECT IdAcc, game_id, rank, gender, prixw FROM users WHERE prixw != ? ORDER BY prixw DESC limit 0, 1",
            [punts]
          )
          .then((rows) => {
            conn.release();
            if (rows[0].length > 0) return resolve(rows);
            else return reject();
          });
      });
    });
  }

  getUsersPrixBySecondPlace(punts) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query(
            "SELECT IdAcc, game_id, rank, gender, prixw FROM users WHERE prixw != ? ORDER BY prixw DESC limit 1, 1",
            [punts]
          )
          .then((rows) => {
            conn.release();
            if (rows[0].length > 0) return resolve(rows);
            else return reject();
          });
      });
    });
  }

  getUsersPrixByThirdPlace(punts) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query(
            "SELECT IdAcc, game_id, rank, gender, prixw FROM users WHERE prixw != ? ORDER BY prixw DESC limit 2, 1",
            [punts]
          )
          .then((rows) => {
            conn.release();
            if (rows[0].length > 0) return resolve(rows);
            else return reject();
          });
      });
    });
  }

  getUsersPrixByAllWinners(starting, end) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query(
            "SELECT IdAcc, game_id, rank, gender, prixw FROM users WHERE prixw != 0 ORDER BY prixw DESC limit ?, ?",
            [starting, end]
          )
          .then((rows) => {
            conn.release();
            if (rows[0].length > 0) return resolve(rows);
            else return reject();
          });
      });
    });
  }

  getBoy(UserId, aId) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query(
            "SELECT Id, aId, type, expire, is_cash, is_gift, amount, expire_time FROM user_avatars WHERE LOWER(`UserId`) = ? AND LOWER(aId) = ?",
            [UserId, aId]
          )
          .then((rows) => {
            conn.release();
            if (rows[0].length > 0) return resolve(rows);
            else return reject();
          });
      });
    });
  }

  updateResetRankingPrix(punts) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query("UPDATE users SET prixw = 0 WHERE prixw != ?", [punts])
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0 || rows[0].changedRows > 0)
              return resolve(rows);
            else return reject();
          });
      });
    });
  }

  deleteAvatarByUserId(user_id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query("DELETE FROM user_avatars WHERE UserId = ?", [user_id])
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0 || rows[0].changedRows > 0)
              return resolve(rows);
            else return reject();
          });
      });
    });
  }

  updateResetRankingRiD(last_reset_rankings, next_reset_rankings, RiD) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query(
            "UPDATE resets_rankings SET last_reset_rankings = ?, next_reset_rankings = ? WHERE r = ?",
            [last_reset_rankings, next_reset_rankings, RiD]
          )
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0 || rows[0].changedRows > 0)
              return resolve(rows);
            else return reject();
          });
      });
    });
  }

  updateResetGPsGuilds(GPsGuild) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query(
            "UPDATE guild SET members = 0 WHERE members >= ? && rank < 26",
            [GPsGuild]
          )
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0 || rows[0].changedRows > 0)
              return resolve(rows);
            else return reject();
          });
      });
    });
  }

  updateGPsRankingSemanalByIdAcc(gp, inicio) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query(
            "UPDATE users SET ranking_semanal = ? WHERE ranking_semanal >= ?",
            [gp, inicio]
          )
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0 || rows[0].changedRows > 0)
              return resolve(rows);
            else return reject();
          });
      });
    });
  }

  getLastRecord(rank) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query(
            "SELECT u.game_id, u.gp, u.rank, u.IdAcc, g.Name FROM users u LEFT JOIN guild_member m ON m.UserId = u.IdAcc LEFT JOIN guild g ON g.Id = m.Id WHERE u.rank = ? ORDER BY u.gp ASC limit 0, 1",
            [rank]
          )
          .then((rows) => {
            conn.release();
            if (rows[0].length > 0) return resolve(rows);
            else return reject();
          });
      });
    });
  }

  getAvatarExpireExItem(user_id, avatar_id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query(
            "SELECT u.IdAcc, u.game_id, u.power_user, v.aId FROM users u INNER JOIN user_avatars v ON u.IdAcc = v.UserId WHERE u.IdAcc = ? AND v.aId = ?",
            [user_id, avatar_id]
          )
          .then((rows) => {
            conn.release();
            if (rows[0].length > 0) return resolve(rows);
            else return reject();
          });
      });
    });
  }

  updateNoWinBonusByIdAcc(date, user_id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query("UPDATE accounts SET no_win_bonus = ? WHERE Id = ?", [
            date,
            user_id,
          ])
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0 || rows[0].changedRows > 0)
              return resolve(rows);
            else return reject();
          });
      });
    });
  }

  getPlayerData(id, session) {
    //JSON.stringify()
    var self = this;
    var data = {};
    return new Promise(function (resolve, reject) {
      self
        .getUserByIdAccGame(id)
        .then(function (rows0) {
          let rows = rows0[0];
          if (rows[0].Session === session) {
            data.user_id = rows[0].IdAcc;
            data.reg_id = rows[0].Id;
            data.game_id = rows[0].game_id;
            data.country = rows[0].country;
            data.banned = rows[0].banned;
            data.rank = rows[0].rank;
            data.gp = rows[0].gp;
            data.event1 = rows[0].event1;
            data.event2 = rows[0].event2;
            data.unlock = rows[0].unlock2;
            data.gold = rows[0].gold;
            data.cash = rows[0].cash;
            data.gender = rows[0].gender;
            data.name_changes = rows[0].name_changes;
            data.photo_url = rows[0].photo_url;
            data.power_user = rows[0].power_user;
            data.plus10gp = rows[0].plus10gp;
            data.megaphones = rows[0].megaphones;
            data.lucky_egg_sec_left = rows[0].lucky_egg_sec_left;
            data.lucky_egg = rows[0].lucky_egg;
            data.electrico = rows[0].electrico;
            data.maps_pack = rows[0].map_pack;
            data.ahead = rows[0].head;
            data.abody = rows[0].body;
            data.aeyes = rows[0].eyes;
            data.aflag = rows[0].flag;
            data.abackground = rows[0].background;
            data.aforeground = rows[0].foreground;
            data.is_muted = rows[0].is_muted;
            data.win = rows[0].win;
            data.loss = rows[0].loss;
            data.punts_prix_user = rows[0].prixw;
            data.gm_probability = rows[0].probability;
            data.computer_ip = rows[0].IP;
            data.block_friend = rows[0].block_friend;
            data.CashCharger = rows[0].CashCharger;
            data.gm = rows[0].gm;
            data.Server_Id = rows[0].Server_Id;
            data.historychat = rows[0].historychat;
            data.gameserverevent = rows[0].date;
            data.server_check = rows[0].server_check;
            data.first_important_ranks = rows[0].first_important_ranks;
            data.evento_time_unix = rows[0].time;
            data.TipEvent = rows[0].tipo;
            data.server_tournament_state = rows[0].server_tournament_state;
            data.gifts_holiday = rows[0].holiday;
            data.my_pin_user = rows[0].PinUser;
            data.guild = "";
            data.guild_id = 0;
            data.guild_points = 0;
            data.tournament_server = rows[0].tournament_server;
            data.tournament_start_time = rows[0].tournament_start_time;
            data.tournament_end_time = rows[0].tournament_end_time;
            data.tournament_gifts_users = rows[0].tournament_gifts_users;
            data.tournament_state_server = rows[0].tournament_state_server;
            data.tournament_check = rows[0].tournament_check;
            data.no_win_bonus_accounts = JSON.parse(rows[0].no_win_bonus);
            self
              .getUserRelationByIdAcc(data.user_id)
              .then(function (rowsdp) {
                let rstd = rowsdp[0];
                data.relation_yo = rstd[0].user_id;
                data.relationship_status = rstd[0].relationship_status;
                data.relationship_with_id = rstd[0].relationship_with_id;
                data.relation_rank = rstd[0].rank;
                data.relation_photo = rstd[0].photo_url;
                data.relation_name = rstd[0].game_id;
                data.relation_gender = rstd[0].gender;
                self
                  .getGuildByIdAcc(data.user_id)
                  .then(function (rows2) {
                    let res2 = rows2[0];
                    data.guild_id = res2[0].Id;
                    data.guild = res2[0].Name;
                    data.guild_job = res2[0].Job;
                    data.guild_points = res2[0].points;
                    return resolve(data);
                  })
                  .catch(function (err) {
                    return resolve(data);
                  });
              })
              .catch(function (err) {
                return reject(err);
              });
          } else {
            return reject();
          }
        })
        .catch(function (err) {
          return reject(err);
        });
    });
  }

  getPlayerAvatars(account) {
    var self = this;
    var data = {};
    return new Promise(function (resolve, reject) {
      self
        .getUserAvatarsByIdAcc(account.user_id)
        .then(function (rows) {
          if (rows[0].length > 0) {
            var res0 = rows[0];
            var lstAvatars = [];
            for (var xm in res0) {
              var equip = 0;
              if (
                account.player.ahead == res0[xm].aId ||
                account.player.abody == res0[xm].aId ||
                account.player.aeyes == res0[xm].aId ||
                account.player.aflag == res0[xm].aId ||
                account.player.abackground == res0[xm].aId ||
                account.player.aforeground == res0[xm].aId
              ) {
                equip = 1;
              }
              lstAvatars.push([
                res0[xm].Id,
                res0[xm].aId,
                equip,
                res0[xm].type,
                res0[xm].is_cash,
                res0[xm].is_gift,
                res0[xm].expire_time,
                res0[xm].amount,
              ]);
            }
            data.data_list = lstAvatars;
            return resolve(data);
          } else {
            data.data_list = [];
            return resolve(data);
          }
        })
        .catch(function (err) {
          data.data_list = [];
          return resolve(data);
        });
    });
  }
  updateMegaphone(cant, user_id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query(
            "UPDATE users SET megaphones = megaphones + ? WHERE IdAcc = ?",
            [cant, user_id]
          )
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0 || rows[0].changedRows > 0)
              return resolve(rows);
            else return reject();
          });
      });
    });
  }

  updatelucky(cant, user_id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query(
            "UPDATE users SET lucky_egg_sec_left = lucky_egg_sec_left + ? WHERE IdAcc = ?",
            [cant, user_id]
          )
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0 || rows[0].changedRows > 0)
              return resolve(rows);
            else return reject();
          });
      });
    });
  } //
  UpdateAvatarAmountBuggle(UserId) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query(
            "UPDATE user_avatars SET amount = amount - 1 WHERE UserId = ? AND aId = ?",
            [UserId, 894]
          )
          .then((rows) => {
            conn.release();
            if (rows[0].length > 0) return resolve(rows);
            else return reject();
          });
      });
    });
  }

  UpdateAvatarAmountlucky(UserId) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query(
            "UPDATE user_avatars SET amount = amount - 1 WHERE UserId = ? AND aId = ?",
            [UserId, 2319]
          )
          .then((rows) => {
            conn.release();
            if (rows[0].length > 0) return resolve(rows);
            else return reject();
          });
      });
    });
  }

  getGoldCashByIdAcc(id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query("SELECT gold, cash FROM users WHERE IdAcc = ?", [id])
          .then((rows) => {
            conn.release();
            if (rows[0].length > 0) return resolve(rows);
            else return reject();
          });
      });
    });
  }

  putUserAvatars(data) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn.query("INSERT into user_avatars SET ?", [data]).then((rows) => {
          conn.release();
          if (rows[0].affectedRows > 0) return resolve(rows);
          else return reject();
        });
      });
    });
  }

  updateGoldCashByIdAcc(sql, mont, id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn.query(sql, [mont, id]).then((rows) => {
          conn.release();
          if (rows[0].affectedRows > 0 || rows[0].changedRows > 0)
            return resolve(rows);
          else return reject();
        });
      });
    });
  }

  buyAvatarForAccount(user_id, is_cash, precio, data_insert) {
    var self = this;
    var data = {};
    return new Promise(function (resolve, reject) {
      self
        .getGoldCashByIdAcc(user_id)
        .then(function (rows) {
          var res0 = rows[0][0];
          var gold = res0.gold;
          var cash = res0.cash;
          var trans_valido = false;
          if (is_cash) {
            if (cash >= precio) trans_valido = true;
          } else {
            if (gold >= precio) trans_valido = true;
          }
          if (trans_valido) {
            self
              .putUserAvatars(data_insert)
              .then(function (rows2) {
                var scpt = "UPDATE users SET cash = cash - ? WHERE IdAcc = ?";
                if (is_cash === true) {
                  data.gold = gold - precio;
                } else {
                  scpt = "UPDATE users SET gold = gold - ? WHERE IdAcc = ?";
                  data.cash = cash - precio;
                }
                self
                  .updateGoldCashByIdAcc(scpt, precio, user_id)
                  .then(function (rows3) {
                    return resolve(data);
                  })
                  .catch(function (err) {
                    Logger.error("" + err.stack);
                    return reject(data);
                  });
              })
              .catch(function (err) {
                Logger.error("" + err.stack);
                return reject(data);
              });
          } else {
            return reject(data);
          }
        })
        .catch(function (err) {
          Logger.error("" + err.stack);
          return reject(data);
        });
    });
  }

  dontExitsUserByGameId(id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query("SELECT game_id FROM users WHERE LOWER(`game_id`) = ?", [id])
          .then((rows) => {
            conn.release();
            if (rows[0].length > 0) return reject();
            else return resolve();
          });
      });
    });
  }

  dontExitsUserByUsername(username) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query(
            "SELECT Name, Username FROM accounts WHERE LOWER(`Username`) = ?",
            [username]
          )
          .then((rows) => {
            conn.release();
            if (rows[0].length > 0) return reject();
            else return resolve();
          });
      });
    });
  }

  updateGameIdAndCashByIdAcc(nname, discount, user_id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query(
            "UPDATE users SET game_id = ?, name_changes = name_changes + 1, cash = cash - ? WHERE IdAcc = ?",
            [nname, discount, user_id]
          )
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0 || rows[0].changedRows > 0)
              return resolve(rows);
            else return reject();
          });
      });
    });
  }

  /*updateMaxBoss(user_id) {
        var self = this;
        return new Promise(function (resolve, reject) {
            self.connection.getConnection().then(conn => {
                conn.query('UPDATE users SET unlock2=unlock2+1 WHERE IdAcc = ?', [user_id])
                    .then(rows => {
                        conn.release();
                        if (rows[0].affectedRows > 0 || rows[0].changedRows > 0)
                            return resolve(rows);
                        else
                            return reject();
                    });
            });
        });
    }*/

  updateUsernameByIdAcc(nname, user_id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query("UPDATE accounts SET Username = ? WHERE Id = ?", [
            nname,
            user_id,
          ])
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0 || rows[0].changedRows > 0)
              return resolve(rows);
            else return reject();
          });
      });
    });
  }

  changeName(nname, account) {
    nname = nname.replace("%", "");
    nname = nname.replace("\\", "");
    nname = nname.replace("/", "");
    nname = nname.replace("'", "");
    nname = nname.replace('"', "");
    nname = nname.replace("<", "");
    nname = nname.replace(">", "");
    nname = nname.replace("|", "");
    nname = nname.replace(",", "");
    nname = nname.replace(".", "");
    nname = nname.replace("+", "");
    nname = nname.replace("-", "");
    var self = this;
    var data = {};
    return new Promise(function (resolve, reject) {
      self
        .dontExitsUserByGameId(nname)
        .then(function () {
          self
            .dontExitsUserByUsername(nname)
            .then(function () {
              var discount = 0;
              if (account.player.name_changes > 0) {
                discount = 4000;
              }
              if (account.player.cash < discount) {
                data.error_cash = true;
              } else {
                account.player.name_changes += 1;
                account.player.cash = parseInt(account.player.cash - discount);
                self
                  .updateGameIdAndCashByIdAcc(
                    nname,
                    discount,
                    account.player.user_id
                  )
                  .then(function (rows2) {
                    self
                      .updateUsernameByIdAcc(nname, account.player.user_id)
                      .then(function (rows4) {
                        data.change = true;
                        return resolve(data);
                      });
                  });
              }
            })
            .catch(function (err) {
              data.error_exist = true;
              return reject(data);
            });
        })
        .catch(function (err) {
          data.error_exist = true;
          return reject(data);
        });
    });
  }

  dontExistGuildName(name) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query("SELECT * FROM guild WHERE LOWER(`Name`) = ?", [name])
          .then((rows) => {
            conn.release();
            if (rows[0].length > 0) return reject();
            else return resolve();
          });
      });
    });
  }
  updateNewVersionName(nombrenuevo, nombrewher) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query("UPDATE users SET game_id = ? WHERE game_id = ?", [
            nombrenuevo,
            nombrewher,
          ])
          .then((rows) => {
            conn.release();
            if (rows[0].length > 0) return reject();
            else return resolve();
          });
      });
    });
  }
  putGuild(name) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query(
            "INSERT INTO guild SET Name = ?, points = 0, members = 0, rank = 0, about = 'Bienvenidos'",
            [name]
          )
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0) return resolve(rows);
            else return reject();
          });
      });
    });
  }

  putGuildMember(guild_id, user_id, job) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query("INSERT INTO guild_member SET Id = ?, UserId = ?, Job = ?", [
            guild_id,
            user_id,
            job,
          ])
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0) return resolve(rows);
            else return reject();
          });
      });
    });
  }

  updateUserDiscountGoldForGuild(mont, user_id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query("UPDATE users SET gold = gold - ? WHERE IdAcc = ?", [
            mont,
            user_id,
          ])
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0 || rows[0].changedRows > 0)
              return resolve(rows);
            else return reject();
          });
      });
    });
  }

  createGuild(name, account) {
    var self = this;
    var data = {};
    var tmpname = name + "";
    var tmplow = tmpname.toLowerCase();
    return new Promise(function (resolve, reject) {
      self
        .dontExistGuildName(tmplow)
        .then(function (rows) {
          self.putGuild(name).then(function (rows1) {
            var res1 = rows1[0];
            var nguild_id = res1.insertId;
            self
              .putGuildMember(nguild_id, account.user_id, 1)
              .then(function (rows2) {
                self
                  .updateUserDiscountGoldForGuild(500000, account.user_id)
                  .then(function (rows2) {
                    account.player.guild = name;
                    account.player.guild_id = nguild_id;
                    account.player.guild_job = 1;
                    data.complete = true;
                    return resolve(data);
                  });
              });
          });
        })
        .catch(function (err) {
          data.error_exist = true;
          return reject(data);
        });
    });
  }

  deleteGuildMember(user_id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query("DELETE FROM guild_member WHERE UserId = ?", [user_id])
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0 || rows[0].changedRows > 0)
              return resolve(rows);
            else return reject();
          });
      });
    });
  }

  leaveGuild(id_user, callback) {
    var self = this;
    var data = {};
    return new Promise(function (resolve, reject) {
      self
        .deleteGuildMember(id_user)
        .then(function (rows) {
          data.complete = true;
          return resolve(data);
        })
        .catch(function (err) {
          data.error_querry = true;
          return reject(data);
        });
    });
  }

  DeleteGuildByMembersId(guild_id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query("DELETE FROM guild_member WHERE Id = ?", [guild_id])
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0 || rows[0].changedRows > 0)
              return resolve(rows);
            else return reject();
          });
      });
    });
  }

  DeleteGuildByName(Name) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn.query("DELETE FROM guild WHERE Name = ?", [Name]).then((rows) => {
          conn.release();
          if (rows[0].affectedRows > 0 || rows[0].changedRows > 0)
            return resolve(rows);
          else return reject();
        });
      });
    });
  }

  DeleteNameGuild(Name, Guild_ID) {
    var self = this;
    var data = {};
    return new Promise(function (resolve, reject) {
      self
        .DeleteGuildByName(Name)
        .then(function (rows) {
          self
            .DeleteGuildByMembersId(Guild_ID)
            .then(function (rows) {
              data.complete = true;
              return resolve(data);
            })
            .catch(function (err) {
              data.error_querry = true;
              return reject(data);
            });
        })
        .catch(function (err) {
          data.error_querry = true;
          return reject(data);
        });
    });
  }

  deleteGuildMemberByIdGuild(guild_id, user_id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query("DELETE FROM guild_member WHERE Id = ? and UserId = ?", [
            guild_id,
            user_id,
          ])
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0 || rows[0].changedRows > 0)
              return resolve(rows);
            else return reject();
          });
      });
    });
  }

  kickGuild(user_id, guild_id) {
    var self = this;
    var data = {};
    return new Promise(function (resolve, reject) {
      self
        .deleteGuildMemberByIdGuild(guild_id, user_id)
        .then(function (rows) {
          data.complete = true;
          return resolve(data);
        })
        .catch(function (err) {
          data.error_querry = true;
          return reject(data);
        });
    });
  }

  getGuildById(guild_id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query("SELECT * FROM guild WHERE Id = ?", [guild_id])
          .then((rows) => {
            conn.release();
            if (rows[0].length > 0) return resolve(rows);
            else return reject();
          });
      });
    });
  }

  getGuildByName(guild) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query(
            "SELECT u.game_id, u.gp, u.rank, u.gender, u.IdAcc, g.Id, g.Name, g.points, g.img, g.fondo, g.about, g.website, m.Job FROM users u INNER JOIN guild_member m ON m.UserId = u.IdAcc INNER JOIN guild g ON g.Id = m.Id WHERE g.Name = ? ORDER BY u.gp DESC",
            [guild]
          )
          .then((rows) => {
            conn.release();
            if (rows[0].length > 0) return resolve(rows);
            else return reject();
          });
      });
    });
  }

  joinGuild(account, guild_id) {
    var self = this;
    var data = {};
    return new Promise(function (resolve, reject) {
      self
        .getGuildById(guild_id)
        .then(function (rows) {
          self
            .putGuildMember(guild_id, account.user_id, 0)
            .then(function (rows1) {
              account.player.guild = rows[0][0].Name;
              account.player.guild_id = guild_id;
              account.player.guild_job = 0;
              data.good = true;
              return resolve(data);
            });
        })
        .catch(function (err) {
          data.error_exist = true;
          return reject(data);
        });
    });
  }

  updateGoldGpWinLossByIdAcc(
    win_gold,
    win_gp,
    is_win,
    is_loss,
    win_gp2,
    user_id
  ) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query("INSERT INTO games (user_id,gp,win,freg) VALUES (?,?,?,?)", [
            user_id,
            win_gp,
            is_win,
            Date.now(),
          ])
          .then((rows) => {
            conn.release();
          });
      });
      self.connection.getConnection().then((conn) => {
        conn
          .query(
            "UPDATE users SET gold = gold + ?, gp = gp + ?, win = win + ?, loss = loss + ?, ranking_semanal = ranking_semanal + ? WHERE IdAcc = ?",
            [win_gold, win_gp, is_win, is_loss, win_gp2, user_id]
          )
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0 || rows[0].changedRows > 0)
              return resolve(rows);
            else return reject();
          });
      });
    });
  }

  updateLeftByIdAcc(win_gold, win_gp, is_loss, user_id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query(
            "UPDATE users SET gold = gold - ?, gp = gp - ?, loss = loss + ? WHERE IdAcc = ?",
            [win_gold, win_gp, is_loss, user_id]
          )
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0 || rows[0].changedRows > 0)
              return resolve(rows);
            else return reject();
          });
      });
    });
  }

  updateGpsByGuildId(gps_guild, id_guild) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query("UPDATE guild SET members = members + ? WHERE Id = ?", [
            gps_guild,
            id_guild,
          ])
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0 || rows[0].changedRows > 0)
              return resolve(rows);
            else return reject();
          });
      });
    });
  }

  updateUser(account, callback) {
    var self = this;
    var data = {};
    return new Promise(function (resolve, reject) {
      self
        .updateGoldGpWinLossByIdAcc(
          account.player.win_gold,
          account.player.win_gp,
          account.player.is_win,
          account.player.is_loss,
          account.player.win_gp,
          account.user_id
        )
        .then(function (rows) {
          if (account.player.guild !== "") {
            self
              .updateGpsByGuildId(
                account.player.win_gp,
                account.player.guild_id
              )
              .then(function (rows2) {
                /*Logger.info('Se actualizo los GPs al guild: '+account.player.guild+' - User: '+account.player.game_id);*/
              });
          }
          account.player.win_gold = 0;
          account.player.win_gp = 0;
          data.correct = true;
          return resolve(data);
        });
    });
  }

  sendGift(user_id, item_id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query(
            "INSERT INTO user_avatars (UserId, aId, type, is_cash, is_gift, amount, expire_time) VALUES (?, ?, '0', '0', '1', '0', '0')",
            [user_id, item_id]
          )
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0 || rows[0].changedRows > 0)
              return resolve(rows);
            else return reject();
          });
      });
    });
  }

  getEventLogByIdAcc(user_id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query("SELECT Event1, Event2 FROM users WHERE IdAcc = ?", [user_id])
          .then((rows) => {
            conn.release();
            if (rows[0].length > 0) return resolve(rows);
            else return reject();
          });
      });
    });
  }

  updateEventLogByIdAcc(scr, user_id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query("UPDATE event_log SET ? WHERE Id = ?", [scr, user_id])
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0 || rows[0].changedRows > 0)
              return resolve(rows);
            else return reject();
          });
      });
    });
  }

  updateGoldCashEventByIdAcc(gold, cash, user_id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query(
            "UPDATE users SET cash = cash + ?, gold = gold + ? WHERE IdAcc = ?",
            [cash, gold, user_id]
          )
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0 || rows[0].changedRows > 0)
              return resolve(rows);
            else return reject();
          });
      });
    });
  }

  putEventLogOnIdAcc(scr) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn.query("INSERT INTO event_log SET ?", [scr]).then((rows) => {
          conn.release();
          if (rows[0].affectedRows > 0) return resolve(rows);
          else return reject();
        });
      });
    });
  }
  eventS(type, time, id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      if (type == 1) {
        self.connection.getConnection().then((conn) => {
          conn
            .query("UPDATE users SET Event1 = ? WHERE IdAcc = ?", [time, id])
            .then((rows) => {
              conn.release();
              if (rows[0].length > 0) return resolve(rows);
              else return reject();
            });
        });
      } else {
        self.connection.getConnection().then((conn) => {
          conn
            .query("UPDATE users SET Event2 = ? WHERE IdAcc = ?", [time, id])
            .then((rows) => {
              conn.release();
              if (rows[0].length > 0) return resolve(rows);
              else return reject();
            });
        });
      }
    });
  }
  eventUpdate(account, type, callback) {
    var self = this;
    var date = Date.now;
    var rdata = {};
    return new Promise(function (resolve, reject) {
      self
        .getEventLogByIdAcc(account.user_id)
        .then(function (rows) {
          var res0 = rows[0][0];
          var update = false;
          if (type === 0) {
            if (res0.Event1 <= Date.now()) {
              update = true;
            }
          } else if (type === 3) {
            if (res0.Event2 <= Date.now()) {
              update = true;
            }
          }
          if (update) {
            var xevent1 = 0;
            var xevent2 = 0;
            var sctp = "";
            if (type === 0) {
              xevent1 = date() + 4 * 60 * 60 * 1000;
            } else if (type === 3) {
              xevent2 = date() + 1 * 24 * 60 * 60 * 1000;
            }
            var datup1 = {
              Event1: xevent1,
            };
            var datup2 = {
              Event2: xevent2,
            };
            if (type === 0) {
              sctp = datup1;
            } else if (type === 3) {
              sctp = datup2;
            }
            self
              .updateEventLogByIdAcc(sctp, account.user_id)
              .then(function (rows2) {
                var xgold = 1000;
                var xcash = 300;
                if (type === 0) {
                } else if (type === 3) {
                  xgold = 1000;
                  xcash = 1000;
                }
                self
                  .updateGoldCashEventByIdAcc(xgold, xcash, account.user_id)
                  .then(function (rows3) {
                    rdata.complete = true;
                    rdata.gold = xgold;
                    rdata.cash = xcash;
                    return resolve(rdata);
                  });
              });
          }
        })
        .catch(function (err) {
          var datup1 = {
            Id: account.user_id,
            Event1: 0,
            Event2: 0,
          };
          self
            .putEventLogOnIdAcc(datup1)
            .then(function (rows0) {
              return reject(rdata);
            })
            .catch(function (err) {
              return reject(rdata);
            });
        });
    });
  }

  getUserAvatarById(arr) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query("SELECT * FROM user_avatars WHERE Id IN (?)", [arr])
          .then((rows) => {
            conn.release();
            if (rows[0].length > 0) return resolve(rows);
            else return reject();
          });
      });
    });
  }

  updateUserAvatarEquipById(data, reg_id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query("UPDATE user_avatar_equiped SET ? WHERE Id = ?", [
            data,
            reg_id,
          ])
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0 || rows[0].changedRows > 0)
              return resolve(rows);
            else return reject();
          });
      });
    });
  }

  equipAvatar(arr_up, account, callback) {
    var self = this;
    var rdata = {};
    return new Promise(function (resolve, reject) {
      self
        .getUserAvatarById(arr_up)
        .then(function (r_data) {
          var rows = r_data[0];
          var gst = account.player.gender;
          var gender = 0;
          if (gst === "f") gender = 1;
          for (var r in rows) {
            var dx = rows[r];
            var item_data = account.gameserver.avatars.getAvatar2(
              dx.aId,
              gender
            );
            if (item_data !== null) {
              var _xtype = item_data[2];
              if (_xtype === 0) {
                account.player.ahead = dx.aId;
              } else if (_xtype === 1) {
                account.player.abody = dx.aId;
              } else if (_xtype === 2) {
                account.player.aeyes = dx.aId;
              } else if (_xtype === 3) {
                account.player.aflag = dx.aId;
              } else if (_xtype === 4) {
                account.player.abackground = dx.aId;
              } else if (_xtype === 5) {
                account.player.aforeground = dx.aId;
              }
            }
          }
          var data = {
            head: account.player.ahead,
            body: account.player.abody,
            eyes: account.player.aeyes,
            flag: account.player.aflag,
            background: account.player.abackground,
            foreground: account.player.aforeground,
          };
          self
            .updateUserAvatarEquipById(data, account.player.reg_id)
            .then(function (rows) {
              rdata.complete = true;
              return resolve(rdata);
            });
        })
        .catch(function (err) {
          return reject();
        });
    });
  }

  getListGM(callback) {}

  updatePuntsPrixByIdAcc(punts, user_id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query("UPDATE users SET prixw = ? WHERE IdAcc = ?", [punts, user_id])
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0 || rows[0].changedRows > 0)
              return resolve(rows);
            else return reject();
          });
      });
    });
  }

  updatePrix(punts, account) {
    var self = this;
    var data = {};
    return new Promise(function (resolve, reject) {
      self
        .updatePuntsPrixByIdAcc(punts, account.user_id)
        .then(function (rows2) {
          /*account.player.punts_prix_user = 0;*/
          return resolve(data);
        })
        .catch(function (err) {
          return reject();
        });
    });
  }

  updateCashChargeById(user_id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query(
            "UPDATE users SET CashCharger = CashCharger + 1 WHERE IdAcc = ?",
            [user_id]
          )
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0 || rows[0].changedRows > 0)
              return resolve(rows);
            else return reject();
          });
      });
    });
  }

  updatePowerUser(power_user, user_id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query("UPDATE users SET power_user = ? WHERE IdAcc = ?", [
            power_user,
            user_id,
          ])
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0 || rows[0].changedRows > 0)
              return resolve(rows);
            else return reject();
          });
      });
    });
  }
  /*updateLuckyEgg(power_user, user_id) {
        var self = this;
        return new Promise(function (resolve, reject) {
            self.connection.getConnection().then(conn => {
                conn.query('UPDATE users SET lucky_egg_sec_left = ? WHERE IdAcc = ?', [power_user, user_id])
                    .then(rows => {
                        conn.release();
                        if (rows[0].affectedRows > 0 || rows[0].changedRows > 0)
                            return resolve(rows);
                        else
                            return reject();
                    });
            });
        });
    } */
  updateLuckyEggLeft(user_id, lucky_egg_sec_left) {
    this.connection.getConnection().then((conn) => {
      conn
        .query("UPDATE users SET lucky_egg_sec_left = ? WHERE IdAcc = ?", [
          lucky_egg_sec_left,
          user_id,
        ])
        .then((rows) => {
          conn.release();
          if (!rows[0].affectedRows > 0)
            console.log(
              "No se ha podido actualizar el lucky_egg_sec_left del usuario ",
              user_id
            );
          /* else return reject();*/
        });
    });
  }
  reduceLuckyEgg(user_id, cb) {
    this.connection.getConnection().then((conn) => {
      conn
        .query(
          "UPDATE user_avatars SET amount = amount-1 WHERE UserId = ? AND aId = 2319",
          [user_id]
        )
        .then((rows) => {
          cb();
          conn.release();
        });
    });
  }
  reduceMegaphone(user_id, cb) {
    this.connection.getConnection().then((conn) => {
      conn
        .query(
          "UPDATE user_avatars SET amount = amount-1 WHERE UserId = ? AND aId = 894",
          [user_id]
        )
        .then((rows) => {
          cb();
          conn.release();
        });
    });
  }

  updatePlusGP(user_id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query("UPDATE users SET plus10gp = 1 WHERE IdAcc = ?", [user_id])
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0 || rows[0].changedRows > 0)
              return resolve(rows);
            else return reject();
          });
      });
    });
  }

  updateMegaPone(uses, user_id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query(
            "UPDATE users SET megaphones = megaphones + ? WHERE IdAcc = ?",
            [uses, user_id]
          )
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0 || rows[0].changedRows > 0)
              return resolve(rows);
            else return reject();
          });
      });
    });
  }

  updateMegaPoneAbate(user_id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query(
            "UPDATE users SET megaphones = megaphones - 1 WHERE IdAcc = ?",
            [user_id]
          )
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0 || rows[0].changedRows > 0)
              return resolve(rows);
            else return reject();
          });
      });
    });
  }

  updateMaps(user_id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query("UPDATE users SET map_pack = 1 WHERE IdAcc = ?", [user_id])
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0 || rows[0].changedRows > 0)
              return resolve(rows);
            else return reject();
          });
      });
    });
  }

  sendRank(rank, user_id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query("UPDATE users SET rank = rank + ? WHERE IdAcc = ?", [
            rank,
            user_id,
          ])
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0 || rows[0].changedRows > 0)
              return resolve(rows);
            else return reject();
          });
      });
    });
  }

  sendCash(cash, user_id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query("UPDATE users SET cash = cash + ? WHERE IdAcc = ?", [
            cash,
            user_id,
          ])
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0 || rows[0].changedRows > 0)
              return resolve(rows);
            else return reject();
          });
      });
    });
  }

  sendGold(gold, user_id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query("UPDATE users SET gold = gold + ? WHERE IdAcc = ?", [
            gold,
            user_id,
          ])
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0 || rows[0].changedRows > 0)
              return resolve(rows);
            else return reject();
          });
      });
    });
  }

  updateRankSpecialByIdAcc(rank, gm, user_id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query("UPDATE users SET rank = ?, gm = ? WHERE IdAcc = ?", [
            rank,
            gm,
            user_id,
          ])
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0 || rows[0].changedRows > 0)
              return resolve(rows);
            else return reject();
          });
      });
    });
  }

  putSpecialRanksByUserId(UserId, game_id, rank, cash, time) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query(
            "INSERT into rankspecial SET IdAcc = ?, game_id = ?, rank = ?, cash = ?, time = ?",
            [UserId, game_id, rank, cash, time]
          )
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0) return resolve(rows);
            else return reject();
          });
      });
    });
  }

  updateRelationStatusByIdAcc(status, casado, user_id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query(
            "UPDATE relationship SET relationship_status = ?, relationship_with_id = ? WHERE user_id = ?",
            [status, casado, user_id]
          )
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0 || rows[0].changedRows > 0)
              return resolve(rows);
            else return reject();
          });
      });
    });
  }

  updateBlockFriendByIdAcc(status, user_id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query("UPDATE users SET block_friend = ? WHERE IdAcc = ?", [
            status,
            user_id,
          ])
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0 || rows[0].changedRows > 0)
              return resolve(rows);
            else return reject();
          });
      });
    });
  }

  sendDeleteCash(gold, cash, user_id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query(
            "UPDATE users SET gold = gold - ?, cash = cash - ? WHERE IdAcc = ?",
            [gold, cash, user_id]
          )
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0 || rows[0].changedRows > 0)
              return resolve(rows);
            else return reject();
          });
      });
    });
  }

  updateEndRelationByIdAcc(status, pareja, user_id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query(
            "UPDATE relationship SET relationship_status = ?, relationship_with_id = ? WHERE user_id = ?",
            [status, pareja, user_id]
          )
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0 || rows[0].changedRows > 0)
              return resolve(rows);
            else return reject();
          });
      });
    });
  }

  putCommandsGMGift(comando, gift, cash, text, gm, user, user_id, time) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query(
            "INSERT INTO commands SET comando = ?, gift = ?, cash = ?, text = ?, gm = ?, user = ?, user_id = ?, time = ?",
            [comando, gift, cash, text, gm, user, user_id, time]
          )
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0) return resolve(rows);
            else return reject();
          });
      });
    });
  }

  putBannedByUserId(UserId, razon, date, gm, gm_id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query(
            "INSERT into banned SET UserId = ?, razon = ?, date = ?, gm = ?, gm_id = ?",
            [UserId, razon, date, gm, gm_id]
          )
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0) return resolve(rows);
            else return reject();
          });
      });
    });
  }

  updateBannedStatus(stateban, user_id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query("UPDATE users SET banned = ? WHERE IdAcc = ?", [
            stateban,
            user_id,
          ])
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0 || rows[0].changedRows > 0)
              return resolve(rows);
            else return reject();
          });
      });
    });
  }

  updateIpComputerUsers(ip, user_id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query("UPDATE users SET IP = ? WHERE IdAcc = ?", [ip, user_id])
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0 || rows[0].changedRows > 0)
              return resolve(rows);
            else return reject();
          });
      });
    });
  }

  updateAccountByIpComputer(ip, user_id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query("UPDATE accounts SET IP = ? WHERE Id = ?", [ip, user_id])
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0 || rows[0].changedRows > 0)
              return resolve(rows);
            else return reject();
          });
      });
    });
  }

  /* FB */
  getAccountByFBId(id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query("SELECT * FROM accounts where facebook_id = ?", [id])
          .then((rows) => {
            conn.release();
            if (rows[0].length > 0) return resolve(rows);
            else return reject();
          });
      });
    });
  }

  putAccountFB(data) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection
        .getConnection()
        .then((conn) => {
          //console.log(conn);
          conn
            .query("INSERT into accounts SET ?", [data])
            .then((rows) => {
              console.log(rows);
              conn.release();
              if (rows[0].affectedRows > 0) return resolve(rows);
              else return reject();
            })
            .catch(function (err) {
              //console.log(err);
              return reject(error);
            });
        })
        .catch(function (err) {
          return reject(error);
        });
    });
  }

  putUserFB(data) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection
        .getConnection()
        .then((conn) => {
          conn
            .query("INSERT into users SET ?", [data])
            .then((rows) => {
              conn.release();
              if (rows[0].affectedRows > 0) return resolve(rows);
              else return reject();
            })
            .catch(function (err) {
              return reject(error);
            });
        })
        .catch(function (err) {
          return reject(error);
        });
    });
  }

  putRelationNew(relation) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query("INSERT into relationship SET user_id = ?", [relation])
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0) return resolve(rows);
            else return reject();
          });
      });
    });
  }

  putAvatarUseFB(data) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query("INSERT into user_avatar_equiped SET ?", [data])
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0) return resolve(rows);
            else return reject();
          });
      });
    });
  }

  putComputerIPBanned(ip, razon, gm, idgm) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query(
            "INSERT into ip_user_banned SET ip = ?, razon = ?, gm = ?, IdGM = ?",
            [ip, razon, gm, idgm]
          )
          .then((rows) => {
            conn.release();
            if (rows[0].affectedRows > 0) return resolve(rows);
            else return reject();
          });
      });
    });
  }

  getEmail(mail, id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query("UPDATE accounts SET Email = ? WHERE Id = ?", [mail, id])
          .then((rows) => {
            conn.release();
            if (rows[0].length > 0) return resolve(rows);
            else return reject();
          });
      });
    });
  }

  getExchange(game_id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query(
            "SELECT u.IdAcc, u.game_id, a.email, a.password, u.name_changes, u.cash, u.gold, u.country, u.rank, u.gp, u.bg_url, u.photo_url FROM users u LEFT JOIN accounts a on u.IdAcc=a.id WHERE IdAcc = ?",
            [game_id]
          )
          .then((rows) => {
            conn.release();
            if (rows[0].length > 0) return resolve(rows);
            else return reject();
          });
      });
    });
  }

  /* USER WEB */
  getUserByGameId(game_id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query(
            "SELECT u.IdAcc, u.game_id, ct.email, u.rank, u.gold, u.cash, u.photo_url, u.power_user, u.plus10gp, u.map_pack, u.megaphones, u.bg_url, u.country, u.banned, u.rank, u.gp, u.win, u.gender, u.loss, u.block_friend, u.IP, u.ranking_semanal, ct.Password, ct.views, ct.Birthday, ae.head, ae.body, ae.eyes, ae.flag, ae.background, ae.foreground FROM users u INNER JOIN accounts ct ON ct.Id = u.IdAcc INNER JOIN user_avatar_equiped ae ON u.Id = ae.Id WHERE LOWER(`game_id`) = ?",
            [game_id]
          )
          .then((rows) => {
            conn.release();
            if (rows[0].length > 0) return resolve(rows);
            else return reject();
          });
      });
    });
  }

  /////

  searchRank() {
    var self = this;
    var gp = 6237949;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query("select count(*) as cr from users where gp > ?", [gp])
          .then((rows) => {
            conn.release();
            if (rows[0].length > 0) {
              return resolve(rows);
            } else return reject();
          });
      });
    });
  }

  listuserRank(top) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query(
            "SELECT * FROM users where gp > 6237949 ORDER BY gp DESC LIMIT ?",
            [top]
          )
          .then((rows) => {
            conn.release();
            if (rows[0].length > 0) {
              return resolve(rows);
            } else return reject();
          });
      });
    });
  }

  editRANK(rank, id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query("update users set rank = ? where IdAcc = ? AND rank < 25", [
            rank,
            id,
          ])
          .then((rows) => {
            conn.release();
            if (rows[0].length > 0) {
              return resolve(rows);
            } else return reject();
          });
      });
    });
  }

  myRank(a) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query("select rank from users where IdAcc = ?", [a])
          .then((rows) => {
            conn.release();
            if (rows[0].length > 0) {
              return resolve(rows);
            } else return reject();
          });
      });
    });
  }

  DeleteAvatarX(UserId, type) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        if (type == 1) {
          conn
            .query("UPDATE users SET power_user = 0 WHERE IdAcc = ?", [UserId])
            .then((rows) => {
              conn.release();
              if (rows[0].length > 0) return resolve(rows);
              else return reject();
            });
        } else if (type == 2) {
          conn
            .query("UPDATE users SET plus10gp = 0 WHERE IdAcc = ?", [UserId])
            .then((rows) => {
              conn.release();
              if (rows[0].length > 0) return resolve(rows);
              else return reject();
            });
        } else if (type == 3) {
          conn
            .query("UPDATE users SET map_pack = 0 WHERE IdAcc = ?", [UserId])
            .then((rows) => {
              conn.release();
              if (rows[0].length > 0) return resolve(rows);
              else return reject();
            });
        } else if (type == 4) {
          conn
            .query("UPDATE users SET lucky_egg = 0 WHERE IdAcc = ?", [UserId])
            .then((rows) => {
              conn.release();
              if (rows[0].length > 0) return resolve(rows);
              else return reject();
            });
        } else if (type == 5) {
          conn
            .query("UPDATE users SET megaphones = 0 WHERE IdAcc = ?", [UserId])
            .then((rows) => {
              conn.release();
              if (rows[0].length > 0) return resolve(rows);
              else return reject();
            });
        } else if (type == 6) {
          conn
            .query("UPDATE users SET mobile_fox = 0 WHERE IdAcc = ?", [UserId])
            .then((rows) => {
              conn.release();
              if (rows[0].length > 0) return resolve(rows);
              else return reject();
            });
        }
      });
    });
  }

  selectItemDetail(IdItem) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query("select * from user_avatars WHERE Id = ?", [IdItem])
          .then((rows) => {
            conn.release();
            if (rows[0].length > 0) return resolve(rows);
            else return reject();
          });
      });
    });
  }

  defaultAvatars(myid, a, b) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query(
            "UPDATE user_avatar_equiped SET head = ? , body = ?, eyes = 0, flag = 0, background = 0, foreground = 0 WHERE Id = ?",
            [a, b, myid]
          )
          .then((rows) => {
            conn.release();
            if (rows[0].length > 0) return resolve(rows);
            else return reject();
          });
      });
    });
  }
  /////

  searchRank() {
    var self = this;
    var gp = 6237949;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query("select count(*) as cr from users where gp > ?", [gp])
          .then((rows) => {
            conn.release();
            if (rows[0].length > 0) {
              return resolve(rows);
            } else return reject();
          });
      });
    });
  }

  listuserRank(top) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query(
            "SELECT * FROM users where gp > 6237949 ORDER BY gp DESC LIMIT ?",
            [top]
          )
          .then((rows) => {
            conn.release();
            if (rows[0].length > 0) {
              return resolve(rows);
            } else return reject();
          });
      });
    });
  }

  editRANK(rank, id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query("update users set rank = ? where IdAcc = ? AND rank < 25", [
            rank,
            id,
          ])
          .then((rows) => {
            conn.release();
            if (rows[0].length > 0) {
              return resolve(rows);
            } else return reject();
          });
      });
    });
  }

  myRank(a) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query("select rank from users where IdAcc = ?", [a])
          .then((rows) => {
            conn.release();
            if (rows[0].length > 0) {
              return resolve(rows);
            } else return reject();
          });
      });
    });
  }

  verifyUser(game_id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query("SELECT game_id FROM users where game_id = ?", [game_id])
          .then((rows) => {
            conn.release();
            if (rows[0].length > 0) {
              return resolve(rows);
            } else return reject();
          });
      });
    });
  }
  verifyMail(mail) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query("SELECT count(*) as verdad FROM users where email = ?", [mail])
          .then((rows) => {
            conn.release();
            if (rows[0].length > 0) {
              return resolve(rows);
            } else return reject();
          });
      });
    });
  }
  tokenVerify(a, b) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query(
            "SELECT count(*) as verdad, (select game_id from users where IdAcc = ?) as nick, idAcc FROM tokenMail where token = ? AND idAcc = ?",
            [b, a, b]
          )
          .then((rows) => {
            conn.release();
            if (rows[0].length > 0) {
              return resolve(rows);
            } else return reject();
          });
      });
    });
  }

  verificarNombre(a) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query("SELECT count(*) as name1 from users where game_id = ?", [a])
          .then((rows) => {
            conn.release();
            if (rows[0].length > 0) {
              return resolve(rows);
            } else return reject();
          });
      });
    });
  }
  verificarNombre2(a) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query("SELECT count(*) as name2 from users where name2 = ?", [a])
          .then((rows) => {
            conn.release();
            if (rows[0].length > 0) {
              return resolve(rows);
            } else return reject();
          });
      });
    });
  }
  verificarNombre3(a) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query("SELECT count(*) as T from accounts where name2 = ?", [a])
          .then((rows) => {
            conn.release();
            if (rows[0].length > 0) {
              return resolve(rows);
            } else return reject();
          });
      });
    });
  }
  tokenDelete(a) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query("DELETE FROM tokenmail WHERE idAcc = ?", [a])
          .then((rows) => {
            conn.release();
            if (rows[0].length > 0) {
              return resolve(rows);
            } else return reject();
          });
      });
    });
  }

  tokenMail(data) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn.query("INSERT into tokenMail SET ?", [data]).then((rows) => {
          conn.release();
          if (rows[0].affectedRows > 0) return resolve(rows);
          else return reject();
        });
      });
    });
  }

  tokenACTV(a) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.connection.getConnection().then((conn) => {
        conn
          .query("UPDATE users SET activate = 2 WHERE IdAcc = ?", [a])
          .then((rows) => {
            conn.release();
            if (rows[0].length > 0) return resolve(rows);
            else return reject();
          });
      });
    });
  }

  ///
};

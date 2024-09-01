# Game logic

## Diagram

The drawings or diagrams shown in this section can be modified through the following link [Draw](https://app.diagrams.net/#G1mIfIJ19J7oW2Iw8vo3GrpQjWOFiF0zVn#%7B%22pageId%22%3A%22kow-iseRG58Xen-pIDAg%22%7D)

## Weather

![alt text](../../crafts/image.png)

## Bullets

the logic of the bullet may consist of the following diagram

> **Why this logic?** <br />
> The idea is to have a better bale structure to easily manage its lifecycle.

![alt text](../../crafts/bullets.png)

> **Action Bullet?** <br />

| First Header  | Second Header                      | Código                                                                 |
| ------------- | ---------------------------------- | ---------------------------------------------------------------------- |
| CHANGE_BULLET | Switching from 1 bullet to another | `{ "type": "CHANGE_BULLET", "metadata": { "bullet_id": 1 }, "time": 3000 } `    |
| CREATE_MINE   | Content Cell                       | `{ "type": "CREATE_MINE", "metadata": { "position": "IN_EXPLODE_BULLET" } }` |

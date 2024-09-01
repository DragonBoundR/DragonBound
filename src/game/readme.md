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

> **How to describe Action Bullet?** <br />

| First Header  | Second Header                               | Código                                                                                | Mobile                |
| ------------- | ------------------------------------------- | ------------------------------------------------------------------------------------- | --------------------- |
| CHANGE_BULLET | Switching from 1 bullet to another          | `{ "type": "CHANGE_BULLET", "metadata": { "bullet_id": 1 }, "time": 3000 } `          | ARMOR, TURTLE, BOOMER |
| CREATE_MINE   | Create mine                                 | `{ "type": "CREATE_MINE", "metadata": { "position": "IN_EXPLODE_BULLET" } }`          | x                     |
| FREEZE_ENEMY  | Freeze your enemies when the bullet strikes | `{ "type": "FREEZE_ENEMY", "metadata": { "radius": 33 } }`                            | x                     |
| WALK          | walk when you come ashore                   | `{ "type": "WALK", "metadata": { "DIR": "LEFT", "DURATION": "STEPS", "STEPS": 20 } }` | FROG                  |

### Use cases

#### Armor

> **S1**

```json

{
    "name": "ga"
}
```

sadf

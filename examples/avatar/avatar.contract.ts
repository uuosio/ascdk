import { Name, check, action, contract, requireAuth, MultiIndex, Contract } from 'as-chain'
import { avatar, updatevalues, removekeys } from './avatar.constants';
import { Avatar, KeyValue } from './avatar.tables';

@contract(avatar)
export class AvatarContract extends Contract {
    avatarsTable: MultiIndex<Avatar> = Avatar.getTable(this.receiver)

    @action(updatevalues)
    updatevalues(
        actor: Name,
        values: KeyValue[],
    ): void {
        // Authorization
        requireAuth(actor)

        // Validation
        check(values.length > 0, "must provide atleast one value")
        for (let i = 0; i < values.length; i++) {
            check(values[i].key.length < 255, "max key length is 255")
            check(values[i].value.length < 255, "max value length is 255")
        }

        // Find account
        let avatar = this.avatarsTable.getByKey(actor.N)
        if (avatar == null) {
            avatar = new Avatar(actor, values)
        } else {
            const existingKeys = avatar.values.map<string>(value => value.key)
            for (let i = 0; i < values.length; i++) {
                const keyMatchIndex = existingKeys.indexOf(values[i].key)
                if (keyMatchIndex == -1) {
                    avatar.values.push(values[i])
                } else {
                    avatar.values[keyMatchIndex].value = values[i].value
                }
            }
        }

        // Save
        this.avatarsTable.set(avatar, actor)
    }

    @action(removekeys)
    removekeys(
        actor: Name,
        keys: string[],
    ): void {
        // Authorization
        requireAuth(actor)

        // Validation
        const avatarItr = this.avatarsTable.requireFind(actor.N, `no avatar found with name ${actor}`)
        const avatar = this.avatarsTable.get(avatarItr)

        // Update
        for (let i = 0; i < avatar.values.length; i++) {
            const keyMatchIndex = keys.indexOf(avatar.values[i].key)
            if (keyMatchIndex != -1) {
                avatar.values.splice(keyMatchIndex, 1)
            }
        }

        // Save
        if (avatar.values.length > 0) {
            this.avatarsTable.update(avatarItr, avatar, actor)
        } else {
            this.avatarsTable.remove(avatarItr)
        }
    }
}
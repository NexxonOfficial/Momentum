import path from "path";
import fs from "fs";
import { dirname } from 'dirname-filename-esm'

import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction } from 'discord.js';
import Users from '../../../model/user.js';
import Profiles from '../../../model/profiles.js';

export const data = new SlashCommandBuilder()
    .setName('addall')
    .setDescription('Allows you to give a user all cosmetics. Note: This will reset all your lockers to default')
    .addUserOption(option =>
        option.setName('user')
            .setDescription('The user you want to give the cosmetic to')
            .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false)

export async function execute(interaction: ChatInputCommandInteraction) {
    const __dirname = dirname(import.meta);
    const selectedUser = interaction.options.getUser('user');
    const selectedUserId: string = selectedUser?.id!;

    const user = await Users.findOne({ discordId: selectedUserId });
    if (!user) return interaction.reply({ content: "That user does not own an account", ephemeral: true });
    const profile = await Profiles.findOne({ accountId: user.accountId });
    if (!profile) return interaction.reply({ content: "That user does not have a profile", ephemeral: true });

    const allItems = JSON.parse(fs.readFileSync(path.join(__dirname, "../../../../Config/DefaultProfiles/allathena.json"), 'utf8'))

    Profiles.findOneAndUpdate({ accountId: user.accountId }, { $set: { "profiles.athena.items": allItems.items } }, { new: true }, (err, doc) => {
        if (err) console.log(err);

    });

    await interaction.reply({ content: "Successfully added all skins to the selected account", ephemeral: true });

}
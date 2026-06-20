"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./db");
const models_1 = require("./models");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
async function seedAdmin() {
    await (0, db_1.connectDB)();
    const email = 'Waqar@nchgroup.in';
    const password = 'nch@waqar21';
    const salt = await bcryptjs_1.default.genSalt(10);
    const hashedPassword = await bcryptjs_1.default.hash(password, salt);
    let adminUser = await models_1.User.findOne({ where: { email } });
    if (adminUser) {
        adminUser.password = hashedPassword;
        adminUser.role = 'admin';
        await adminUser.save();
        console.log('✅ Admin user updated!');
    }
    else {
        adminUser = await models_1.User.create({
            email,
            password: hashedPassword,
            displayName: 'Waqar NCH',
            role: 'admin',
        });
        console.log('✅ Admin user created!');
    }
    process.exit(0);
}
seedAdmin();

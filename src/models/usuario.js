const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');


module.exports = (sequelize) => {
    const Usuario = sequelize.define('Usuario', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: { isEmail: true}, 
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: {
            type: DataTypes.STRING,
            defaulValue: 'admin', //Por ahora todos son admin
        }
    }, {
        hooks: {
            beforeCreate: async (usuario) => {
                const salt = await bcrypt.genSalt(10);
                usuario.password = await bcrypt.hash(usuario.password, salt);
            },
        },
    });

    Usuario.prototype.validPassword = async function(password) {
        return await bcrypt.compare(password, this.password);
    };

    return Usuario;
}
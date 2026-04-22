/**
 * Sistema de Plugins para UNIMAXX
 * Permite extensão do CMS sem modificar o código core
 */

class PluginManager {
    constructor() {
        this.plugins = new Map();
        this.hooks = new Map();
    }

    /**
     * Registrar um novo plugin
     */
    register(name, plugin) {
        if (this.plugins.has(name)) {
            throw new Error(`Plugin ${name} já está registrado`);
        }

        // Validar estrutura do plugin
        if (!plugin.version || !plugin.init) {
            throw new Error(`Plugin ${name} inválido`);
        }

        this.plugins.set(name, {
            ...plugin,
            enabled: false,
            installedAt: new Date()
        });

        console.log(`Plugin ${name} v${plugin.version} registrado`);
    }

    /**
     * Ativar plugin
     */
    enable(name) {
        const plugin = this.plugins.get(name);
        if (!plugin) {
            throw new Error(`Plugin ${name} não encontrado`);
        }

        plugin.enabled = true;
        if (plugin.init) {
            plugin.init();
        }

        console.log(`Plugin ${name} ativado`);
    }

    /**
     * Desativar plugin
     */
    disable(name) {
        const plugin = this.plugins.get(name);
        if (!plugin) return;

        plugin.enabled = false;
        if (plugin.destroy) {
            plugin.destroy();
        }

        console.log(`Plugin ${name} desativado`);
    }

    /**
     * Adicionar hook
     */
    addHook(name, callback) {
        if (!this.hooks.has(name)) {
            this.hooks.set(name, []);
        }
        this.hooks.get(name).push(callback);
    }

    /**
     * Executar hooks
     */
    async executeHook(name, data) {
        const hooks = this.hooks.get(name) || [];
        let result = data;

        for (const hook of hooks) {
            result = await hook(result);
        }

        return result;
    }

    /**
     * Listar plugins
     */
    list() {
        return Array.from(this.plugins.entries()).map(([name, plugin]) => ({
            name,
            version: plugin.version,
            enabled: plugin.enabled,
            description: plugin.description,
            author: plugin.author
        }));
    }
}

// Instância global
const pluginManager = new PluginManager();

// Exemplo de plugin de newsletter
const newsletterPlugin = {
    name: 'Newsletter Advanced',
    version: '1.0.0',
    description: 'Sistema avançado de newsletter com templates',
    author: 'UNIMAXX',

    init() {
        console.log('Newsletter plugin inicializado');
        // Registrar rotas, adicionar hooks, etc.
    },

    destroy() {
        console.log('Newsletter plugin desligado');
    }
};

// Registrar plugin de exemplo (comentado)
// pluginManager.register('newsletter', newsletterPlugin);

module.exports = { PluginManager, pluginManager };

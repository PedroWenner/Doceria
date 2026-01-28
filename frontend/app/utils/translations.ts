export type Language = 'pt' | 'en';

export const translations = {
    pt: {
        common: {
            loading: 'Carregando...',
            save: 'Salvar',
            saving: 'Salvando...',
            cancel: 'Cancelar',
            edit: 'Editar',
            delete: 'Excluir',
            actions: 'Ações',
            status: 'Status',
            image: 'Imagem',
            name: 'Nome',
            description: 'Descrição',
            yes: 'Sim',
            no: 'Não',
            error: 'Erro',
            success: 'Sucesso'
        },
        auth: {
            login_title: 'SweetStore',
            login_subtitle: 'Excelência em cada detalhe',
            email: 'Endereço de E-mail',
            password: 'Senha',
            remember_me: 'Lembrar de mim',
            forgot_password: 'Esqueceu a senha?',
            sign_in: 'Entrar',
            login_failed: 'Falha no login',
            invalid_credentials: 'Credenciais inválidas ou erro no servidor'
        },
        sidebar: {
            dashboard: 'Painel',
            users: 'Usuários',
            products: 'Produtos',
            logout: 'Sair',
            menu: 'Menu',
            settings: 'Configurações',
            audit: 'Auditoria'
        },
        dashboard: {
            welcome: 'Bem-vindo de volta',
            stats: {
                total_users: 'Total de Usuários',
                active_products: 'Produtos Ativos',
                low_stock: 'Estoque Baixo',
                revenue: 'Receita Mensal'
            }
        },
        users: {
            title: 'Gerenciamento de Usuários',
            email: 'E-mail',
            roles: 'Cargos',
            edit_roles: 'Editar Cargos',
            save_changes: 'Salvar Alterações',
            update_success: 'Cargos atualizados com sucesso',
            update_error: 'Falha ao atualizar cargos'
        },
        products: {
            title: 'Produtos',
            new_product: '+ Novo Produto',
            category: 'Categoria',
            price: 'Preço',
            stock: 'Estoque',
            sku: 'SKU',
            min_stock: 'Estoque Mínimo',
            select_category: 'Selecione a Categoria',
            active: 'Ativo',
            draft: 'Rascunho',
            in_stock: 'Em Estoque',
            low_stock: 'Baixo Estoque',
            out_of_stock: 'Sem Estoque',
            no_img: 'Sem Img',
            save_success: 'Produto salvo com sucesso',
            save_error: 'Erro ao salvar produto',
            edit_product: 'Editar Produto'
        },
        audit: {
            title: 'Logs de Auditoria',
            user: 'Usuário',
            event: 'Evento',
            auditable: 'Recurso',
            old_values: 'Valores Antigos',
            new_values: 'Novos Valores',
            date: 'Data',
            filter_user: 'Filtrar Usuário',
            filter_event: 'Filtrar Evento',
            created: 'Criado',
            updated: 'Atualizado',
            deleted: 'Excluído',
            restored: 'Restaurado'
        },
        orders: {
            title: 'Gestão de Pedidos',
            pending: 'Pendente',
            preparing: 'Em Preparo',
            ready: 'Pronto',
            delivered: 'Entregue',
            canceled: 'Cancelado',
            items: 'itens',
            total: 'Total',
            empty: 'Sem pedidos',
            notes: 'Obs',
            delivery_type: {
                delivery: 'Entrega 🛵',
                pickup: 'Retirada 🏪'
            },
            payment: {
                'Credit Card': 'Crédito',
                'Pix': 'Pix',
                'Cash': 'Dinheiro'
            }
        }
    },
    en: {
        common: {
            loading: 'Loading...',
            save: 'Save',
            saving: 'Saving...',
            cancel: 'Cancel',
            edit: 'Edit',
            delete: 'Delete',
            actions: 'Actions',
            status: 'Status',
            image: 'Image',
            name: 'Name',
            description: 'Description',
            yes: 'Yes',
            no: 'No',
            error: 'Error',
            success: 'Success'
        },
        auth: {
            login_title: 'SweetStore',
            login_subtitle: 'Indulge in Excellence',
            email: 'Email Address',
            password: 'Password',
            remember_me: 'Remember me',
            forgot_password: 'Forgot password?',
            sign_in: 'Sign In',
            login_failed: 'Login failed',
            invalid_credentials: 'Invalid credentials or server error'
        },
        sidebar: {
            dashboard: 'Dashboard',
            users: 'Users',
            products: 'Products',
            logout: 'Logout',
            menu: 'Menu',
            settings: 'Settings',
            audit: 'Audit Logs'
        },
        dashboard: {
            welcome: 'Welcome back',
            stats: {
                total_users: 'Total Users',
                active_products: 'Active Products',
                low_stock: 'Low Stock',
                revenue: 'Monthly Revenue'
            }
        },
        users: {
            title: 'User Management',
            email: 'Email',
            roles: 'Roles',
            edit_roles: 'Edit Roles',
            save_changes: 'Save Changes',
            update_success: 'Roles updated successfully',
            update_error: 'Failed to update roles'
        },
        products: {
            title: 'Products',
            new_product: '+ New Product',
            category: 'Category',
            price: 'Price',
            stock: 'Stock',
            sku: 'SKU',
            min_stock: 'Min Stock Level',
            select_category: 'Select Category',
            active: 'Active',
            draft: 'Draft',
            in_stock: 'In Stock',
            low_stock: 'Low Stock',
            out_of_stock: 'Out of Stock',
            no_img: 'No Img',
            save_success: 'Product saved successfully',
            save_error: 'Error saving product',
            edit_product: 'Edit Product'
        },
        audit: {
            title: 'Audit Logs',
            user: 'User',
            event: 'Event',
            auditable: 'Resource',
            old_values: 'Old Values',
            new_values: 'New Values',
            date: 'Date',
            filter_user: 'Filter User',
            filter_event: 'Filter Event',
            created: 'Created',
            updated: 'Updated',
            deleted: 'Deleted',
            restored: 'Restored'
        },
        orders: {
            title: 'Order Management',
            pending: 'Pending',
            preparing: 'Preparing',
            ready: 'Ready',
            delivered: 'Delivered',
            canceled: 'Canceled',
            items: 'items',
            total: 'Total',
            empty: 'No orders',
            notes: 'Note',
            delivery_type: {
                delivery: 'Delivery 🛵',
                pickup: 'Pickup 🏪'
            },
            payment: {
                'Credit Card': 'Credit Card',
                'Pix': 'Pix',
                'Cash': 'Cash'
            }
        }
    }
};
